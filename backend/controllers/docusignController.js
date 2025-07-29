const docusign = require('docusign-esign');
const fs = require('fs');

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