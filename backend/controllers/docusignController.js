const docusign = require('docusign-esign');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Configuration
const INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY;
const USER_ID = process.env.DOCUSIGN_USER_ID;
const IMPERSONATED_USER_GUID = USER_ID;
const PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n');
const BASE_PATH = 'https://demo.docusign.net/restapi';
const REDIRECT_URL = process.env.DOCUSIGN_REDIRECT_URL;
const JWTLIFETIME = 3600; // 1 hour

// Helper to get JWT auth token
async function getJWTAuthToken() {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BASE_PATH);
  
  try {
    const results = await apiClient.requestJWTUserToken(
      INTEGRATION_KEY,
      IMPERSONATED_USER_GUID,
      ['signature', 'impersonation'],
      PRIVATE_KEY,
      JWTLIFETIME
    );
    return { 
      accessToken: results.body.access_token,
      apiClient 
    };
  } catch (err) {
    if (err.response && err.response.body && err.response.body.error === 'consent_required') {
      throw new Error('consent_required');
    }
    throw err;
  }
}

// Generate consent URL
exports.getConsentUrl = (req, res) => {
  const authUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${INTEGRATION_KEY}&redirect_uri=${REDIRECT_URL}`;
  res.json({ url: authUrl });
};

// POST /api/docusign/create-envelope
exports.createEnvelope = async (req, res) => {
  try {
    // Check if environment variables are set
    if (!INTEGRATION_KEY || !USER_ID || !PRIVATE_KEY) {
      console.error('Missing DocuSign environment variables:', {
        hasIntegrationKey: !!INTEGRATION_KEY,
        hasUserId: !!USER_ID,
        hasPrivateKey: !!PRIVATE_KEY
      });
      return res.status(500).json({ 
        error: 'DocuSign configuration missing',
        details: 'Please check your environment variables: DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_PRIVATE_KEY'
      });
    }

    let accessToken, apiClient;
    
    try {
      console.log('Attempting to get JWT auth token...');
      const auth = await getJWTAuthToken();
      accessToken = auth.accessToken;
      apiClient = auth.apiClient;
      console.log('JWT auth successful');
    } catch (authError) {
      console.error('JWT auth error:', authError);
      if (authError.message === 'consent_required') {
        return res.status(401).json({ 
          error: 'Consent required',
          solution: 'Please visit /api/docusign/consent-url first to grant consent'
        });
      }
      return res.status(500).json({ 
        error: 'DocuSign authentication failed',
        details: authError.message
      });
    }

    apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

    // Get user info
    console.log('Getting user info...');
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    console.log('Account ID:', accountId);

    // Create envelope definition
    const envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = req.body.subject || 'Please sign this document';
    envDef.status = 'sent';

    // Handle document input
    let document;
    if (req.body.documentBase64) {
      console.log('Using provided PDF document');
      document = {
        documentBase64: req.body.documentBase64,
        name: req.body.documentName || 'document.pdf',
        fileExtension: 'pdf',
        documentId: '1'
      };
    } else if (req.body.documentHtml) {
      console.log('Using HTML document');
      document = {
        documentBase64: Buffer.from(req.body.documentHtml).toString('base64'),
        name: 'document.html',
        fileExtension: 'html',
        documentId: '1'
      };
    } else if (req.body.documentPath) {
      console.log('Using file path document');
      const fileBytes = fs.readFileSync(req.body.documentPath);
      document = {
        documentBase64: fileBytes.toString('base64'),
        name: req.body.documentName || 'document.pdf',
        fileExtension: 'pdf',
        documentId: '1'
      };
    } else {
      console.log('Using default fallback document');
      // Default fallback document
      document = {
        documentBase64: Buffer.from('<h1>Please sign this document</h1><p>Signature: /sn1/</p>').toString('base64'),
        name: 'default.html',
        fileExtension: 'html',
        documentId: '1'
      };
    }
    envDef.documents = [document];

    // Configure recipients
    if (!req.body.recipients || !req.body.recipients.length) {
      throw new Error('At least one recipient is required');
    }

    envDef.recipients = {
      signers: req.body.recipients.map((recipient, index) => ({
        email: recipient.email,
        name: recipient.name,
        recipientId: (index + 1).toString(),
        routingOrder: '1',
        clientUserId: recipient.clientUserId || (index + 1).toString(),
        tabs: {
          signHereTabs: [{
            anchorString: recipient.anchorString || '/sn1/',
            anchorYOffset: recipient.anchorYOffset || '10',
            anchorUnits: recipient.anchorUnits || 'pixels',
            anchorXOffset: recipient.anchorXOffset || '20'
          }]
        }
      }))
    };

    // Create envelope
    console.log('Creating envelope...');
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.createEnvelope(accountId, { envelopeDefinition: envDef });
    const envelopeId = envelope.envelopeId;
    console.log('Envelope created with ID:', envelopeId);

    // Create recipient view for first recipient (embedded signing)
    const firstRecipient = req.body.recipients[0];
    const viewRequest = new docusign.RecipientViewRequest();

    // Construct dynamic redirect URL based on dealId
    const dealId = req.body.dealId || 'C12312181'; // Default fallback
    const dynamicRedirectUrl = `http://localhost:5173/contract/${dealId}?step=3`;
    viewRequest.returnUrl = dynamicRedirectUrl;

    console.log('Using redirect URL:', dynamicRedirectUrl);
    viewRequest.authenticationMethod = 'none';
    viewRequest.email = firstRecipient.email;
    viewRequest.userName = firstRecipient.name;
    viewRequest.clientUserId = firstRecipient.clientUserId || '1';

    console.log('Creating recipient view...');
    const results = await envelopesApi.createRecipientView(
      accountId, 
      envelopeId, 
      { recipientViewRequest: viewRequest }
    );
    
    console.log('Recipient view created, URL:', results.url);
    res.json({ 
      envelopeId,
      url: results.url,
      status: 'sent'
    });

  } catch (err) {
    console.error('DocuSign error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.body
    });
    res.status(500).json({ 
      error: 'DocuSign operation failed',
      details: err.message,
      ...(err.response?.body ? { docusignError: err.response.body } : {})
    });
  }
};

// Get signing URL for existing envelope
exports.getSigningUrl = async (req, res) => {
  try {
    const envelopeId = req.params.envelopeId;
    if (!envelopeId) return res.status(400).json({ error: 'Missing envelopeId' });
    
    // Auth
    const { accessToken, apiClient } = await getJWTAuthToken();
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    
    // Get user info
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    
    // Create recipient view for the existing envelope
    const viewRequest = new docusign.RecipientViewRequest();
    
    // Use the same recipient info as in create-envelope
    viewRequest.returnUrl = `http://localhost:5173/contract/${req.query.dealId || 'C12312181'}?step=3`;
    viewRequest.authenticationMethod = 'none';
    viewRequest.email = "sohaib@gmail.com";
    viewRequest.userName = "Sohaib Ikram";
    viewRequest.clientUserId = "123";
    
    console.log('Creating recipient view for existing envelope:', envelopeId);
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const results = await envelopesApi.createRecipientView(
      accountId, 
      envelopeId, 
      { recipientViewRequest: viewRequest }
    );
    
    console.log('Recipient view created for existing envelope, URL:', results.url);
    res.json({ 
      envelopeId,
      url: results.url,
      status: 'ready'
    });
    
  } catch (err) {
    console.error('Get signing URL error:', err);
    res.status(500).json({ 
      error: 'Failed to get signing URL', 
      details: err.message 
    });
  }
};

// Download signed PDF endpoint
exports.downloadSignedDocument = async (req, res) => {
  try {
    const envelopeId = req.params.envelopeId;
    if (!envelopeId) return res.status(400).json({ error: 'Missing envelopeId' });
    // Auth
    const { accessToken, apiClient } = await getJWTAuthToken();
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    // Get user info
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    // Get the document list
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const docsList = await envelopesApi.listDocuments(accountId, envelopeId);
    // Find the completed PDF (usually documentId '1')
    const docId = docsList.envelopeDocuments?.[0]?.documentId || '1';
    // Download the PDF
    const pdfBuffer = await envelopesApi.getDocument(accountId, envelopeId, docId, null);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Signed-Contract.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Download signed PDF error:', err);
    res.status(500).json({ error: 'Failed to download signed PDF', details: err.message });
  }
};

// Email transporter configuration (same as subadminController.js)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// POST /api/docusign/send-to-seller
exports.sendToSeller = async (req, res) => {
  try {
    console.log('Send to seller request received:', { 
      envelopeId: req.body.envelopeId, 
      sellerEmail: req.body.sellerEmail,
      hasContractData: !!req.body.contractData 
    });

    const { envelopeId, sellerEmail, contractData } = req.body;
    if (!envelopeId || !sellerEmail) {
      console.log('Missing required fields:', { envelopeId, sellerEmail });
      return res.status(400).json({ error: 'Missing envelopeId or sellerEmail' });
    }

    console.log('Starting DocuSign authentication...');
    // Download the signed PDF from DocuSign
    const { accessToken, apiClient } = await getJWTAuthToken();
    console.log('DocuSign authentication successful');
    
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    console.log('Account ID:', accountId);

    console.log('Fetching envelope documents...');
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const docsList = await envelopesApi.listDocuments(accountId, envelopeId);
    console.log('Documents found:', docsList.envelopeDocuments?.length || 0);
    
    const docId = docsList.envelopeDocuments?.[0]?.documentId || '1';
    console.log('Using document ID:', docId);

    console.log('Downloading PDF...');
    const pdfBuffer = await envelopesApi.getDocument(accountId, envelopeId, docId, null);
    console.log('PDF downloaded, size:', pdfBuffer.length, 'bytes');

    // Check email configuration
    console.log('Email configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD,
      to: sellerEmail
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email configuration missing. Please check EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }

    // Email content (simple template)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: 'Signed Contract from Buy Box Mafia',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Buy Box Mafia</h1>
            <p style="margin: 10px 0 0 0;">Signed Contract Attached</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Dear Seller,</h2>
            <p style="color: #666; line-height: 1.6;">
              Please find attached the signed contract for your records.<br/>
              If you have any questions, please contact us.
            </p>
          </div>
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">© 2025 Buy Box Mafia. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'Signed-Contract.pdf',
          content: pdfBuffer,
        },
      ],
    };

    console.log('Sending email...');
    // Send the email
    const emailResult = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', emailResult.messageId);

    res.json({ success: true, message: 'Contract sent to seller successfully!' });
  } catch (err) {
    console.error('Send to seller error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    
    // More specific error messages
    let errorMessage = 'Failed to send contract to seller';
    if (err.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD.';
    } else if (err.code === 'ECONNECTION') {
      errorMessage = 'Email connection failed. Please check your internet connection.';
    } else if (err.message.includes('consent_required')) {
      errorMessage = 'DocuSign consent required. Please contact administrator.';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      details: err.message,
      code: err.code 
    });
  }
};