const docusign = require("docusign-esign");
const fs = require("fs");
const nodemailer = require("nodemailer");

const INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY;
const USER_ID = process.env.DOCUSIGN_USER_ID;
const IMPERSONATED_USER_GUID = USER_ID;
const PRIVATE_KEY_ENV = process.env.DOCUSIGN_PRIVATE_KEY;
const PRIVATE_KEY = PRIVATE_KEY_ENV
  ? PRIVATE_KEY_ENV.replace(/\\n/g, "\n")
  : null;
const BASE_PATH = process.env.DOCUSIGN_BASE_PATH;
const REDIRECT_URL = process.env.DOCUSIGN_REDIRECT_URL;
const JWTLIFETIME = 3600;
const OAUTH_BASE_PATH = process.env.DOCUSIGN_OAUTH_BASE_PATH;
const RETURN_URL = process.env.DOCUSIGN_RETURN_URL;
const FRONTEND_URL= process.env.FRONTEND_URL

async function getJWTAuthToken() {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BASE_PATH);
  apiClient.setOAuthBasePath(OAUTH_BASE_PATH);

  if (!INTEGRATION_KEY || !IMPERSONATED_USER_GUID || !PRIVATE_KEY) {
    const missing = {
      hasIntegrationKey: !!INTEGRATION_KEY,
      hasUserId: !!IMPERSONATED_USER_GUID,
      hasPrivateKey: !!PRIVATE_KEY,
    };
    const error = new Error("DocuSign configuration missing");
    error.details = missing;
    throw error;
  }

  try {
    const results = await apiClient.requestJWTUserToken(
      INTEGRATION_KEY,
      IMPERSONATED_USER_GUID,
      ["signature", "impersonation"],
      PRIVATE_KEY,
      JWTLIFETIME
    );
    return {
      accessToken: results.body.access_token,
      apiClient,
    };
  } catch (err) {
    if (
      err.response &&
      err.response.body &&
      err.response.body.error === "consent_required"
    ) {
      throw new Error("consent_required");
    }
    throw err;
  }
}

exports.getConsentUrl = (req, res) => {
  const authUrl = `https://${OAUTH_BASE_PATH}/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${INTEGRATION_KEY}&redirect_uri=${REDIRECT_URL}`;
  res.json({ url: authUrl });
};

exports.createEnvelope = async (req, res) => {
  try {
    // Basic env validation
    if (!INTEGRATION_KEY || !USER_ID || !PRIVATE_KEY) {
      console.error("Missing DocuSign environment variables:", {
        hasIntegrationKey: !!INTEGRATION_KEY,
        hasUserId: !!USER_ID,
        hasPrivateKey: !!PRIVATE_KEY,
      });
      return res.status(500).json({
        error: "DocuSign configuration missing",
        details:
          "Please check your environment variables: DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_PRIVATE_KEY",
      });
    }

    // Authenticate with JWT
    let accessToken, apiClient;
    try {
      const auth = await getJWTAuthToken();
      accessToken = auth.accessToken;
      apiClient = auth.apiClient;
    } catch (authError) {
      console.error("JWT auth error:", authError);
      if (authError.message === "consent_required") {
        return res.status(401).json({
          error: "Consent required",
          solution:
            "Please visit /api/docusign/consent-url first to grant consent",
        });
      }
      return res.status(500).json({
        error: "DocuSign authentication failed",
        details: authError.message,
        ...(authError.details ? { missing: authError.details } : {}),
      });
    }

    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    // Get accountId
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    apiClient.setBasePath(`${userInfo.accounts[0].baseUri}/restapi`);
    const clientUserId = req.body.clientUserId || "1"; // Default or from request

    // Build envelope definition
    const envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = req.body.subject || "Please sign this document";
    // Set to "sent" to immediately send; use "created" to leave as draft.
    envDef.status = req.body.status || "sent";

    // Prepare document (supports documentBase64, documentHtml, documentPath or default)
    let document;
    if (req.body.documentBase64) {
      document = {
        documentBase64: req.body.documentBase64,
        name: req.body.documentName || "document.pdf",
        fileExtension: "pdf",
        documentId: "1",
      };
    } else if (req.body.documentHtml) {
      document = {
        documentBase64: Buffer.from(req.body.documentHtml).toString("base64"),
        name: req.body.documentName || "document.html",
        fileExtension: "html",
        documentId: "1",
      };
    } else if (req.body.documentPath) {
      const fileBytes = fs.readFileSync(req.body.documentPath);
      document = {
        documentBase64: fileBytes.toString("base64"),
        name: req.body.documentName || "document.pdf",
        fileExtension: "pdf",
        documentId: "1",
      };
    } else {
      document = {
        documentBase64: Buffer.from(
          "<h1>Please sign this document</h1><p>Signature: /sn1/</p>"
        ).toString("base64"),
        name: "default.html",
        fileExtension: "html",
        documentId: "1",
      };
    }
    envDef.documents = [document];

    // Validate recipients
    if (
      !req.body.recipients ||
      !Array.isArray(req.body.recipients) ||
      !req.body.recipients.length
    ) {
      return res
        .status(400)
        .json({ error: "At least one recipient is required" });
    }

    // Map recipients -> Signers (ensure clientUserId set for embedded signing)
    // NOTE: clientUserId must match when creating recipient view later.
    const signers = req.body.recipients.map((recipient, index) => {
      if (!recipient.email || !recipient.name) {
        throw new Error(`Recipient at index ${index} is missing email or name`);
      }

      const clientUserId = recipient.clientUserId || String(index + 1);

      return {
        email: recipient.email,
        name: recipient.name,
        recipientId: (index + 1).toString(),
        routingOrder: recipient.routingOrder || "1",
        clientUserId, // required for embedded signing (recipient view)
        tabs: {
          signHereTabs: [
            {
              anchorString: recipient.anchorString || "/sn1/",
              anchorYOffset: recipient.anchorYOffset || "10",
              anchorUnits: recipient.anchorUnits || "pixels",
              anchorXOffset: recipient.anchorXOffset || "20",
            },
          ],
        },
      };
    });

    envDef.recipients = { signers };

    // Create envelope
    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // NOTE: some SDK versions accept (accountId, envDef) while others accept (accountId, { envelopeDefinition: envDef }).
    // Use the pattern your project used previously. Here we use the object wrapper as in your existing code.
    const envelopeSummary = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition: envDef,
    });

    const envelopeId = envelopeSummary.envelopeId;

    return res.json({
      envelopeId,
      status: envelopeSummary?.status || envDef.status || "sent",
      message:
        "Envelope created. To start embedded signing, request a fresh signing URL from /api/docusign/get-signing-url/:envelopeId",
    });
  } catch (err) {
    console.error("DocuSign createEnvelope error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.body,
    });

    // Provide helpful error responses for common cases
    if (
      err.response &&
      err.response.body &&
      err.response.body.error === "consent_required"
    ) {
      return res.status(401).json({
        error: "Consent required",
        details:
          "Please visit /api/docusign/consent-url to grant consent for the integration key.",
      });
    }

    return res.status(500).json({
      error: "DocuSign operation failed",
      details: err.message,
      ...(err.response?.body ? { docusignError: err.response.body } : {}),
    });
  }
};

// improved getSigningUrl
exports.getSigningUrl = async (req, res) => {
  try {
    const envelopeId = req.params.envelopeId;
    if (!envelopeId)
      return res.status(400).json({ error: "Missing envelopeId" });

    // Authenticate and get apiClient
    let auth;
    try {
      auth = await getJWTAuthToken();
    } catch (authErr) {
      console.error("JWT auth error (getSigningUrl):", authErr);
      if (
        authErr.code === "CONSENT_REQUIRED" ||
        authErr.message === "consent_required"
      ) {
        return res.status(401).json({
          error: "Consent required",
          details: "Visit /api/docusign/consent-url to grant consent",
        });
      }
      if (authErr.code === "DOCUSIGN_NETWORK") {
        return res.status(502).json({
          error: "DocuSign network/DNS error",
          details: authErr.message,
        });
      }
      return res.status(500).json({
        error: "DocuSign authentication failed",
        details: authErr.message,
      });
    }

    const { accessToken, apiClient } = auth;
    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    // Get account info and set correct REST base path for this account
    const userInfo = await apiClient.getUserInfo(accessToken);
    if (!userInfo || !userInfo.accounts || userInfo.accounts.length === 0) {
      return res
        .status(500)
        .json({ error: "Unable to obtain DocuSign account information" });
    }

    const account = userInfo.accounts[0];
    const accountId = account.accountId;
    // account.baseUri is like "https://demo.docusign.net"
    apiClient.setBasePath(`${account.baseUri}/restapi`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // list recipients and log them for debugging
    let recipients;
    try {
      recipients = await envelopesApi.listRecipients(accountId, envelopeId);
    } catch (listErr) {
      console.error("Error listing recipients:", {
        message: listErr?.message,
        response: listErr?.response?.body || null,
        code: listErr?.code || null,
      });
      // forward DocuSign error body if present
      return res.status(listErr?.response?.status || 502).json({
        error: "Failed to list recipients",
        details: listErr.message,
        docusignError: listErr?.response?.body || null,
      });
    }

    const signer = recipients?.signers && recipients.signers[0];
    if (!signer) {
      return res.status(400).json({
        error: "No signer found for envelope",
        details: "Envelope has no signers",
      });
    }

    const clientUserId = signer.clientUserId;
    if (!clientUserId) {
      return res.status(400).json({
        error:
          "Signer is not configured for embedded signing (missing clientUserId)",
      });
    }

    const fullAddress = req.query.fullAddress || "";
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = fullAddress
      ? `${FRONTEND_URL}/contract/${encodeURIComponent(
          fullAddress
        )}?step=3`
      : `${FRONTEND_URL}/contract?step=3`;
    viewRequest.authenticationMethod = "none";
    viewRequest.email = signer.email;
    viewRequest.userName = signer.name;
    viewRequest.clientUserId = clientUserId;

    try {
      const results = await envelopesApi.createRecipientView(
        accountId,
        envelopeId,
        {
          recipientViewRequest: viewRequest,
        }
      );

      return res.json({ envelopeId, url: results.url, status: "ready" });
    } catch (dsErr) {
      console.error("DocuSign createRecipientView error:", {
        message: dsErr?.message,
        response: dsErr?.response?.body || null,
        code: dsErr?.code || null,
      });

      // Map common network errors to 502
      if (
        dsErr.code === "ENOTFOUND" ||
        dsErr.code === "EAI_AGAIN" ||
        dsErr.code === "ECONNREFUSED"
      ) {
        return res.status(502).json({
          error: "DocuSign network/DNS error",
          details: dsErr.message,
        });
      }

      return res.status(dsErr?.response?.status || 500).json({
        error: "DocuSign createRecipientView failed",
        details: dsErr.message,
        docusignError: dsErr?.response?.body || null,
      });
    }
  } catch (err) {
    console.error(
      "Get signing URL error (outer):",
      err,
      err?.response?.body || ""
    );
    return res.status(500).json({
      error: "Failed to get signing URL",
      details: err.message,
      docusignError: err?.response?.body || null,
    });
  }
};

exports.getEnvelopeStatus = async (req, res) => {
  try {
    const envelopeId = req.params.envelopeId;
    if (!envelopeId)
      return res.status(400).json({ error: "Missing envelopeId" });

    const { accessToken, apiClient } = await getJWTAuthToken();
    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    apiClient.setBasePath(`${userInfo.accounts[0].baseUri}/restapi`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.getEnvelope(accountId, envelopeId);

    res.json({
      status: envelope.status,
      completed: envelope.status === "completed",
      voided: envelope.status === "voided",
      sentDateTime: envelope.sentDateTime,
      deliveredDateTime: envelope.deliveredDateTime,
      completedDateTime: envelope.completedDateTime,
    });
  } catch (err) {
    console.error("Get envelope status error:", err);
    res.status(500).json({
      error: "Failed to get envelope status",
      details: err.message,
    });
  }
};
exports.downloadSignedDocument = async (req, res) => {
  try {
    const envelopeId = req.params.envelopeId;
    if (!envelopeId)
      return res.status(400).json({ error: "Missing envelopeId" });
    const { accessToken, apiClient } = await getJWTAuthToken();
    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    apiClient.setBasePath(`${userInfo.accounts[0].baseUri}/restapi`);
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const docsList = await envelopesApi.listDocuments(accountId, envelopeId);
    const docId = docsList.envelopeDocuments?.[0]?.documentId || "1";
    const pdfBuffer = await envelopesApi.getDocument(
      accountId,
      envelopeId,
      docId,
      null
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Signed-Contract.pdf"'
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Download signed PDF error:", err);
    res
      .status(500)
      .json({ error: "Failed to download signed PDF", details: err.message });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendToSeller = async (req, res) => {
  try {
    const { envelopeId, sellerEmail, contractData } = req.body;
    if (!envelopeId || !sellerEmail) {
      return res
        .status(400)
        .json({ error: "Missing envelopeId or sellerEmail" });
    }

    const { accessToken, apiClient } = await getJWTAuthToken();

    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    apiClient.setBasePath(`${userInfo.accounts[0].baseUri}/restapi`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const docsList = await envelopesApi.listDocuments(accountId, envelopeId);

    const docId = docsList.envelopeDocuments?.[0]?.documentId || "1";

    const pdfBuffer = await envelopesApi.getDocument(
      accountId,
      envelopeId,
      docId,
      null
    );

    const sellerEnvDef = new docusign.EnvelopeDefinition();
    sellerEnvDef.emailSubject = "Please sign the contract - Buy Box Mafia";
    sellerEnvDef.status = "sent";

    const sellerDocument = {
      documentBase64: pdfBuffer.toString("base64"),
      name: "Contract-for-Seller-Signature.pdf",
      fileExtension: "pdf",
      documentId: "1",
    };
    sellerEnvDef.documents = [sellerDocument];

    const sellerName = contractData?.sellerName || "Seller";
    sellerEnvDef.recipients = {
      signers: [
        {
          email: sellerEmail,
          name: sellerName,
          recipientId: "1",
          routingOrder: "1",
          clientUserId: "seller",
          tabs: {
            signHereTabs: [
              {
                anchorString: "/sn2/",
                anchorYOffset: "10",
                anchorUnits: "pixels",
                anchorXOffset: "20",
              },
            ],
          },
        },
      ],
    };

    const sellerEnvelope = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition: sellerEnvDef,
    });
    const sellerEnvelopeId = sellerEnvelope.envelopeId;

    const sellerViewRequest = new docusign.RecipientViewRequest();
    sellerViewRequest.returnUrl = RETURN_URL;
    sellerViewRequest.authenticationMethod = "none";
    sellerViewRequest.email = sellerEmail;
    sellerViewRequest.userName = sellerName;
    sellerViewRequest.clientUserId = "seller";
    let sellerViewResults;
    try {
      sellerViewResults = await envelopesApi.createRecipientView(
        accountId,
        sellerEnvelopeId,
        { recipientViewRequest: sellerViewRequest }
      );
    } catch (viewErr) {
      console.error(
        "Error creating recipient view:",
        viewErr.response?.body || viewErr.message
      );
      throw viewErr;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error(
        "Email configuration missing. Please check EMAIL_USER and EMAIL_PASSWORD environment variables."
      );
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: "Please Sign the Contract - Buy Box Mafia",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Buy Box Mafia</h1>
            <p style="margin: 10px 0 0 0;">Contract Ready for Your Signature</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Dear ${sellerName},</h2>
            <p style="color: #666; line-height: 1.6;">
              A contract has been prepared and is ready for your signature.<br/>
              Please click the button below to review and sign the document.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${sellerViewResults.url}" style="display: inline-block; background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                📝 Sign Contract Now
              </a>
            </div>
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              <strong>Note:</strong> This link is secure and will take you directly to the signing page. 
              If you have any questions, please contact us immediately.
            </p>
          </div>
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0;">© 2025 Buy Box Mafia. All rights reserved.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "Contract-for-Review.pdf",
          content: pdfBuffer,
        },
      ],
    };

    const emailResult = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Contract sent to seller for signature!",
      sellerEnvelopeId: sellerEnvelopeId,
      sellerSigningUrl: sellerViewResults.url,
    });
  } catch (err) {
    console.error("Send to seller error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });

    let errorMessage = "Failed to send contract to seller";
    if (err.code === "EAUTH") {
      errorMessage =
        "Email authentication failed. Please check EMAIL_USER and EMAIL_PASSWORD.";
    } else if (err.code === "ECONNECTION") {
      errorMessage =
        "Email connection failed. Please check your internet connection.";
    } else if (err.message.includes("consent_required")) {
      errorMessage = "DocuSign consent required. Please contact administrator.";
    }

    res.status(500).json({
      error: errorMessage,
      details: err.message,
      code: err.code,
    });
  }
};

exports.getSellerEnvelopeStatus = async (req, res) => {
  try {
    const envelopeId = req.params.envelopeId;
    if (!envelopeId)
      return res.status(400).json({ error: "Missing envelopeId" });

    const { accessToken, apiClient } = await getJWTAuthToken();
    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    apiClient.setBasePath(`${userInfo.accounts[0].baseUri}/restapi`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.getEnvelope(accountId, envelopeId);

    res.json({
      envelopeId,
      status: envelope.status,
      completed: envelope.status === "completed",
      completedDateTime: envelope.completedDateTime,
    });
  } catch (err) {
    console.error("Get seller envelope status error:", err);
    res.status(500).json({
      error: "Failed to get envelope status",
      details: err.message,
    });
  }
};

exports.downloadSellerSignedDocument = async (req, res) => {
  try {
    const envelopeId = req.params.envelopeId;
    if (!envelopeId)
      return res.status(400).json({ error: "Missing envelopeId" });

    const { accessToken, apiClient } = await getJWTAuthToken();
    apiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);

    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;
    apiClient.setBasePath(`${userInfo.accounts[0].baseUri}/restapi`);

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const docsList = await envelopesApi.listDocuments(accountId, envelopeId);

    const docId = docsList.envelopeDocuments?.[0]?.documentId || "1";

    const pdfBuffer = await envelopesApi.getDocument(
      accountId,
      envelopeId,
      docId,
      null
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Fully-Signed-Contract.pdf"'
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Download seller signed PDF error:", err);
    res.status(500).json({
      error: "Failed to download seller signed PDF",
      details: err.message,
    });
  }
};
