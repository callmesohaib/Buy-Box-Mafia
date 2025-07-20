const { db } = require("../utils/firebase");

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
    buyer.submittedBy = req.body.submittedBy || 'Unknown';
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
    const buyers = await db.collection("buyers").get();
    res
      .status(200)
      .json(buyers.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
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
      buyerData.submittedBy = b.submittedBy || 'Unknown';
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
    if (!updateData.submittedBy) updateData.submittedBy = 'Unknown';
    await db.collection("buyers").doc(id).update(updateData);
    res.status(200).json({ success: true, message: "Buyer updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

