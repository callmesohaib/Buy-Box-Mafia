// backend/routers/docusignRoutes.js
const express = require('express');
const router = express.Router();
const docusignController = require('../controllers/docusignController');

// POST /api/docusign/create-envelope
router.post('/create-envelope', docusignController.createEnvelope);
router.get('/consent-url', docusignController.getConsentUrl);
router.get('/get-signing-url/:envelopeId', docusignController.getSigningUrl);
router.get('/callback', (req, res) => {
  // You can handle the callback here if needed
  // For JWT flow, you typically don't need to do anything with it
  res.redirect('/'); // Or wherever you want to redirect after consent
});
router.get('/download-signed/:envelopeId', docusignController.downloadSignedDocument);
router.post('/send-to-seller', docusignController.sendToSeller);

module.exports = router;
