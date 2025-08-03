const { db, admin } = require("../utils/firebase");

// Transform request body to Firestore deal format
const toFirestoreDeal = (body) => ({
  // Scout Information
  scoutName: body.scoutName,
  scoutEmail: body.scoutEmail,
  scoutPhone: body.scoutPhone,
  scoutCompany: body.scoutCompany,

  // Seller Information
  sellerName: body.sellerName,
  sellerEmail: body.sellerEmail,
  sellerPhone: body.sellerPhone,
  sellerAddress: body.sellerAddress,

  // Property Information
  propertyAddress: body.propertyAddress,
  propertyCity: body.propertyCity,
  propertyState: body.propertyState,
  propertyCountry: body.propertyCountry,
  propertyPrice: body.propertyPrice,
  propertyType: body.propertyType,
  propertyZoning: body.propertyClass ||"Not mention",
  propertySize: body.propertySize,
  apn: body.apn,
  mlsNumber: body.mlsNumber,
  listPrice: body.listPrice,
  listDate: body.listDate,
  status: body.status,

  // Offer Details
  offerPrice: body.offerPrice,
  earnestMoney: body.earnestMoney,
  closingDate: body.closingDate,
  financingType: body.financingType,

  // Terms and Conditions
  inspectionPeriod: body.inspectionPeriod,
  titleInsurance: body.titleInsurance,
  surveyRequired: body.surveyRequired,
  additionalTerms: body.additionalTerms,

  // DocuSign Information
  envelopeId: body.envelopeId,
  signingUrl: body.signingUrl,

  // Deal Status
  dealStatus: body.dealStatus || 'pending',
  dealId: body.dealId,
  
  // Metadata
  createdAt: new Date(),
  updatedAt: new Date(),
  submittedBy: body.submittedBy || 'Unknown',
});

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