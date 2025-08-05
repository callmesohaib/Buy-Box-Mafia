const { db, admin } = require("../utils/firebase");

// Transform request body to Firestore deal format
const toFirestoreDeal = (body) => {
  // Helper to safely get value or fallback to null
  const safe = (v, fallback = null) => (v === undefined ? fallback : v);
  return {
    // Scout Information
    scoutName: safe(body.scoutName, ''),
    scoutEmail: safe(body.scoutEmail, ''),
    scoutPhone: safe(body.scoutPhone, ''),
    scoutCompany: safe(body.Company, ''),

    // Seller Information
    sellerName: safe(body.sellerName, ''),
    sellerEmail: safe(body.sellerEmail, ''),
    sellerPhone: safe(body.sellerPhone, ''),
    sellerAddress: safe(body.sellerAddress, ''),

    // Property Information
    propertyAddress: safe(body.propertyAddress, ''),
    propertyCity: safe(body.propertyCity, ''),
    propertyState: safe(body.propertyState, ''),
    propertyCountry: safe(body.propertyCountry, ''),
    propertyPrice: safe(body.propertyPrice, ''),
    propertyType: safe(body.propertyType, ''),
    propertyZoning: safe(body.propertyZoning, safe(body.propertyClass, 'Not mention')),
    propertyClass: safe(body.propertyClass, ''),
    propertySize: safe(body.propertySize, ''),
    apn: safe(body.apn, ''),
    mlsNumber: safe(body.mlsNumber, ''),
    listPrice: safe(body.listPrice, ''),
    listDate: safe(body.listDate, ''),
    status: safe(body.status, 'Pending'), // Default to "Pending" from dropdown

    // Offer Details
    offerPrice: safe(body.propertyPrice, ''),
    earnestMoney: safe(body.earnestMoney, ''),
    closingDate: safe(body.closingDate, ''),
    financingType: safe(body.financingType, ''),

    // Terms and Conditions
    inspectionPeriod: safe(body.inspectionPeriod, ''),
    titleInsurance: safe(body.titleInsurance, ''),
    surveyRequired: safe(body.surveyRequired, ''),
    additionalTerms: safe(body.additionalTerms, ''),

    // DocuSign Information
    envelopeId: safe(body.envelopeId, ''),
    signingUrl: safe(body.signingUrl, ''),

    // Deal Status - use the same status from dropdown
    dealStatus: safe(body.status, 'Pending'), // Use the same status from dropdown
    dealId: safe(body.mlsNumber, ''),

    // File Upload (store file name or null, not the file object)
    contractFile: body.contractFile && body.contractFile.name ? body.contractFile.name : null,

    // Buyer matching data
    matchedBuyers: Array.isArray(body.matchedBuyers) ? body.matchedBuyers : [],
    buyersCount: safe(body.buyersCount, 0),
    buyerIds: Array.isArray(body.buyerIds) ? body.buyerIds : [],

    // Additional fields from formData (if present)
    scoutNotes: safe(body.scoutNotes, ''),
    Company: safe(body.Company, ''),

    // Metadata
    createdAt: new Date(),
    updatedAt: new Date(),
    submittedBy: safe(body.submittedBy, 'Unknown'),
  };
};

// Add a single deal
exports.addDeal = async (req, res) => {
  try {
    const deal = toFirestoreDeal(req.body);
    const docRef = await db.collection("deals").add(deal);
    res
      .status(201)
      .json({ 
        success: true, 
        id: docRef.id, 
        message: "Deal added successfully",
        dealId: docRef.id
      });
  } catch (error) {
    console.error("Error adding deal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all deals
exports.getDeals = async (req, res) => {
  try {
    const dealsSnapshot = await db.collection("deals").orderBy("createdAt", "desc").get();
    const deals = dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all unique user IDs from submittedBy fields
    const userIds = [...new Set(deals.map(deal => deal.submittedBy).filter(Boolean))];

    // Batch fetch all user documents in one query
    const usersSnapshot = userIds.length > 0 
      ? await db.collection("users")
          .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
          .get()
      : { docs: [] };

    // Create a map of user IDs to names
    const usersMap = {};
    usersSnapshot.forEach(doc => {
      usersMap[doc.id] = doc.data().name || 'Unknown';
    });

    // Enhance deals data with submitter names
    const dealsWithNames = deals.map(deal => ({
      ...deal,
      submittedByName: deal.submittedBy ? usersMap[deal.submittedBy] : 'Unknown'
    }));

    res.status(200).json(dealsWithNames);
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single deal by ID
exports.getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const dealDoc = await db.collection("deals").doc(id).get();
    
    if (!dealDoc.exists) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const deal = { id: dealDoc.id, ...dealDoc.data() };
    res.status(200).json(deal);
  } catch (error) {
    console.error("Error fetching deal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get deals by MLS number
exports.getDealsByMlsNumber = async (req, res) => {
  try {
    const { mlsNumber } = req.params;
    const dealsSnapshot = await db.collection("deals")
      .where("mlsNumber", "==", mlsNumber)
      .orderBy("createdAt", "desc")
      .get();
    
    const deals = dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(deals);
  } catch (error) {
    console.error("Error fetching deals by MLS number:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a deal
exports.updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = new Date();
    
    await db.collection("deals").doc(id).update(updateData);
    res.status(200).json({ success: true, message: "Deal updated successfully" });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a deal
exports.deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("deals").doc(id).delete();
    res.status(200).json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    console.error("Error deleting deal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Import multiple deals
exports.importDeals = async (req, res) => {
  try {
    const deals = req.body.deals;
    if (!Array.isArray(deals)) {
      return res
        .status(400)
        .json({ success: false, message: "deals must be an array" });
    }
    
    const batch = db.batch();
    deals.forEach((deal) => {
      const ref = db.collection("deals").doc();
      const dealData = toFirestoreDeal(deal);
      batch.set(ref, dealData);
    });
    
    await batch.commit();
    res
      .status(201)
      .json({ success: true, message: `${deals.length} deals imported successfully` });
  } catch (error) {
    console.error("Error importing deals:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get deals by status
exports.getDealsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const dealsSnapshot = await db.collection("deals")
      .where("dealStatus", "==", status)
      .orderBy("createdAt", "desc")
      .get();
    
    const deals = dealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(deals);
  } catch (error) {
    console.error("Error fetching deals by status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get potential buyers for a specific deal
exports.getDealMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const dealDoc = await db.collection("deals").doc(id).get();
    
    if (!dealDoc.exists) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    const deal = dealDoc.data();
    const matchedBuyers = deal.matchedBuyers || [];
    const buyerIds = deal.buyerIds || [];

    // If we have buyer IDs, fetch the actual buyer data
    let buyersWithDetails = [];
    if (buyerIds.length > 0) {
      const buyersSnapshot = await db.collection("buyers")
        .where(admin.firestore.FieldPath.documentId(), 'in', buyerIds)
        .get();
      
      buyersWithDetails = buyersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    // Merge matched buyers data with actual buyer details
    const enrichedBuyers = matchedBuyers.map(matchedBuyer => {
      const buyerDetail = buyersWithDetails.find(b => b.id === matchedBuyer.id);
      return {
        ...matchedBuyer,
        ...buyerDetail,
        fitScore: matchedBuyer.matchPercent || 0,
        maxOffer: buyerDetail?.maxOffer || matchedBuyer.maxOffer || 0
      };
    });

    res.status(200).json({
      dealId: id,
      matchedBuyers: enrichedBuyers,
      buyersCount: deal.buyersCount || 0
    });
  } catch (error) {
    console.error("Error fetching deal matches:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get potential buyers count for all deals
exports.getPotentialBuyersCount = async (req, res) => {
  try {
    const dealsSnapshot = await db.collection("deals").get();
    const deals = dealsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      buyersCount: doc.data().buyersCount || 0,
      matchedBuyers: doc.data().matchedBuyers || []
    }));
    
    res.status(200).json(deals);
  } catch (error) {
    console.error("Error fetching potential buyers count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 