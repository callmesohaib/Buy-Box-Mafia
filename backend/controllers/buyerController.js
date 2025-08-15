const { db, admin } = require("../utils/firebase");

// Add a single buyer
toFirestoreBuyer = (body) => ({
  name: body.name,
  email: body.email,
  phone: body.phone,
  city: body.city,
  country: body.country,
  buyingLocations: body.buyingLocations,
  lotSizeMin: body.lotSizeMin,
  lotSizeMax: body.lotSizeMax,
  pricePer: body.pricePer,
  mustBeCleared: body.mustBeCleared,
  zoningTypes: body.zoningTypes,
  accessRequired: body.accessRequired,
  utilities: body.utilities,
  buyOnMarket: body.buyOnMarket,
  budgetMin: body.budgetMin,
  budgetMax: body.budgetMax,
  timeline: body.timeline,
  createdAt: new Date(),
});

exports.addBuyer = async (req, res) => {
  try {
    const buyer = toFirestoreBuyer(req.body);
    buyer.submittedBy = req.body.submittedBy || "Unknown";
    const docRef = await db.collection("buyers").add(buyer);
    res
      .status(201)
      .json({ success: true, id: docRef.id, message: "Buyer added" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBuyers = async (req, res) => {
  try {
    const buyersSnapshot = await db.collection("buyers").get();
    const buyers = buyersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all unique user IDs from submittedBy fields
    const userIds = [
      ...new Set(buyers.map((buyer) => buyer.submittedBy).filter(Boolean)),
    ];

    // Batch fetch all user documents in one query
    const usersSnapshot =
      userIds.length > 0
        ? await db
            .collection("users")
            .where(admin.firestore.FieldPath.documentId(), "in", userIds)
            .get()
        : { docs: [] };

    // Create a map of user IDs to names
    const usersMap = {};
    usersSnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data().name || "Unknown";
    });

    // Enhance buyers data with submitter names
    const buyersWithNames = buyers.map((buyer) => ({
      ...buyer,
      submittedByName: buyer.submittedBy
        ? usersMap[buyer.submittedBy]
        : "Unknown",
    }));

    res.status(200).json(buyersWithNames);
  } catch (error) {
    console.error("Error fetching buyers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.importBuyers = async (req, res) => {
  try {
    const buyers = req.body.buyers;
    if (!Array.isArray(buyers)) {
      return res
        .status(400)
        .json({ success: false, message: "buyers must be an array" });
    }
    const batch = db.batch();
    buyers.forEach((b) => {
      const ref = db.collection("buyers").doc();
      const buyerData = toFirestoreBuyer(b);
      buyerData.submittedBy = b.submittedBy || "Unknown";
      batch.set(ref, buyerData);
    });
    await batch.commit();
    res
      .status(201)
      .json({ success: true, message: `${buyers.length} buyers imported` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("buyers").doc(id).delete();
    res.status(200).json({ success: true, message: "Buyer deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = new Date();
    if (!updateData.submittedBy) updateData.submittedBy = "Unknown";
    await db.collection("buyers").doc(id).update(updateData);
    res.status(200).json({ success: true, message: "Buyer updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTotalBuyersBySubmittedBy = async (req, res) => {
  try {
    const buyersSnapshot = await db.collection("buyers").get();
    const buyers = buyersSnapshot.docs.map((doc) => doc.data());

    // Count buyers by submittedBy field
    const counts = {};
    buyers.forEach((buyer) => {
      const submitter = buyer.submittedBy;
      counts[submitter] = (counts[submitter] || 0) + 1;
    });

    // Convert counts object to an array of { submittedBy, count }
    const result = Object.entries(counts).map(([submittedBy, count]) => ({
      submittedBy,
      count,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching total buyers by submittedBy:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
