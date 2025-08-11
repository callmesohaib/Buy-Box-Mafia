const { db, admin } = require("../utils/firebase");
const nodemailer = require("nodemailer");
const axios = require("axios");

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1403705792003051633/CtZhBmw__sJRTJ1_4Q74ChXuQbK-cZ0MNfDwUP9E6jAixXiJTEwsonezkilYryDMlnT5";
// Transform request body to Firestore deal format
const toFirestoreDeal = (body) => {
  // Helper to safely get value or fallback to null
  const safe = (v, fallback = null) => (v === undefined ? fallback : v);
  return {
    // Scout Information
    scoutName: safe(body.scoutName, ""),
    scoutEmail: safe(body.scoutEmail, ""),
    scoutPhone: safe(body.scoutPhone, ""),
    scoutCompany: safe(body.Company, ""),

    // Seller Information
    sellerName: safe(body.sellerName, ""),
    sellerEmail: safe(body.sellerEmail, ""),
    sellerPhone: safe(body.sellerPhone, ""),
    sellerAddress: safe(body.sellerAddress, ""),

    // Property Information
    urlAddress: safe(body.urlAddress, ""),
    propertyAddress: safe(body.propertyAddress, ""),
    propertyCity: safe(body.propertyCity, ""),
    propertyState: safe(body.propertyState, ""),
    propertyCountry: safe(body.propertyCountry, ""),
    propertyPrice: safe(body.propertyPrice, ""),
    propertyType: safe(body.propertyType, ""),
    propertyZoning: safe(
      body.propertyZoning,
      safe(body.propertyClass, "Not mention")
    ),
    propertySize: safe(body.propertySize, ""),
    apn: safe(body.apn, ""),
    listDate: safe(body.listDate, ""),
    status: safe(body.status, "Pending"),
    taxAssessedValue: safe(body.taxAssessedValue, "N/A"),
    annualTaxes: safe(body.annualTaxes, "N/A"),

    // Offer Details
    offerPrice: safe(body.propertyPrice, ""),
    earnestMoney: safe(body.earnestMoney, ""),
    closingDate: safe(body.closingDate, ""),
    financingType: safe(body.financingType, ""),

    // Terms and Conditions
    inspectionPeriod: safe(body.inspectionPeriod, ""),
    titleInsurance: safe(body.titleInsurance, ""),
    surveyRequired: safe(body.surveyRequired, ""),
    additionalTerms: safe(body.additionalTerms, ""),

    // DocuSign Information
    envelopeId: safe(body.envelopeId, ""),
    signingUrl: safe(body.signingUrl, ""),

    // Deal Status - use the same status from dropdown
    dealStatus: safe(body.status, "Pending"), // Use the same status from dropdown
    dealId: safe(body.dealId, ""),

    contractFile:
      body.contractFile && typeof body.contractFile === "object"
        ? {
            url: body.contractFile.url || null,
            public_id:
              body.contractFile.public_id || body.contractFile.publicId || null,
            original_filename:
              body.contractFile.original_filename ||
              body.contractFile.originalFilename ||
              null,
            bytes: body.contractFile.bytes || null,
          }
        : body.contractFile && body.contractFile.name
        ? body.contractFile.name
        : null,

    // Buyer matching data
    matchedBuyers: Array.isArray(body.matchedBuyers) ? body.matchedBuyers : [],
    buyersCount: safe(body.buyersCount, 0),
    buyerIds: Array.isArray(body.buyerIds) ? body.buyerIds : [],

    // Additional fields from formData (if present)
    scoutNotes: safe(body.scoutNotes, ""),
    Company: safe(body.Company, ""),

    // Metadata
    createdAt: new Date(),
    updatedAt: new Date(),
    submittedBy: safe(body.submittedBy, "Unknown"),
  };
};

// Add a single deal
exports.addDeal = async (req, res) => {
  try {
    const deal = toFirestoreDeal(req.body);
    const docRef = await db.collection("deals").add(deal);
    res.status(201).json({
      success: true,
      id: docRef.id,
      message: "Deal added successfully",
      dealId: docRef.id,
    });
  } catch (error) {
    console.error("Error adding deal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all deals
exports.getDeals = async (req, res) => {
  try {
    const dealsSnapshot = await db
      .collection("deals")
      .orderBy("createdAt", "desc")
      .get();
    const deals = dealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all unique user IDs from submittedBy fields
    const userIds = [
      ...new Set(deals.map((deal) => deal.submittedBy).filter(Boolean)),
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

    // Enhance deals data with submitter names
    const dealsWithNames = deals.map((deal) => ({
      ...deal,
      submittedByName: deal.submittedBy
        ? usersMap[deal.submittedBy]
        : "Unknown",
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
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
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
    const dealsSnapshot = await db
      .collection("deals")
      .where("mlsNumber", "==", mlsNumber)
      .orderBy("createdAt", "desc")
      .get();

    const deals = dealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(deals);
  } catch (error) {
    console.error("Error fetching deals by MLS number:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
async function sendDiscordNotification(scoutName, dealId) {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      embeds: [
        {
          title: "🎉 Deal Approved!",
          description: `A deal has just been **approved** by our team!`,
          color: 0x4caf50, // Green color
          fields: [
            {
              name: "Scout Name",
              value: scoutName,
              inline: true,
            },
            {
              name: "Deal ID",
              value: dealId,
              inline: true,
            },
            {
              name: "Status",
              value: "✅ Approved",
              inline: true,
            },
          ],
          footer: {
            text: `Buy Box Mafia • ${new Date().toLocaleDateString()}`,
          },
          timestamp: new Date(),
        },
      ],
    });

    console.log("✅ Discord notification sent!");
  } catch (err) {
    console.error("❌ Failed to send Discord notification:", err.message);
  }
}
exports.updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = new Date();

    const dealRef = db.collection("deals").doc(id);
    const dealSnapshot = await dealRef.get();
    const oldDeal = dealSnapshot.data();

    await dealRef.update(updateData);

    if (updateData.status === "Approved" && oldDeal.scoutEmail) {
      // Send email
      await sendApprovalEmail(
        oldDeal.scoutEmail,
        oldDeal.scoutName,
        oldDeal.apn
      );

      // Send rich embed to Discord
      await sendDiscordNotification(oldDeal.scoutName, oldDeal.apn);
    }

    res.status(200).json({
      success: true,
      message: "Deal updated successfully",
    });
  } catch (error) {
    console.error("Error updating deal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

async function sendApprovalEmail(email, scoutName, dealId) {
  // Create reusable transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Setup email data
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎉 Your Deal Has Been Approved! - Buy Box Mafia",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #d72638, #ff1744); color: white; padding: 25px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Buy Box Mafia</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Deal Approved!</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Congratulations ${scoutName}!</h2>
        
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          We're excited to inform you that your deal <strong>(ID: ${dealId})</strong> has been officially approved by our team!
        </p>
        
        <div style="background: #fff; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; color: #333; font-weight: bold;">✔️ Deal Status: Approved</p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
            You can now view and manage this deal in your dashboard.
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6; font-size: 14px;">
          <strong>Next Steps:</strong><br>
          - Our team will be in touch shortly regarding the next phases<br>
          - You'll receive updates as the deal progresses<br>
          - Contact us anytime with questions
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
        <p style="margin: 0 0 10px 0;">Need help? Contact our support team</p>
        <p style="margin: 0;">
          © ${new Date().getFullYear()} Buy Box Mafia. All rights reserved.<br>
          <span style="color: #aaa;">123 Business Ave, Your City, ST 12345</span>
        </p>
      </div>
    </div>
  `,
  };

  // Send mail
  await transporter.sendMail(mailOptions);
}

// Delete a deal
exports.deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("deals").doc(id).delete();
    res
      .status(200)
      .json({ success: true, message: "Deal deleted successfully" });
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
    res.status(201).json({
      success: true,
      message: `${deals.length} deals imported successfully`,
    });
  } catch (error) {
    console.error("Error importing deals:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get deals by status
exports.getDealsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const dealsSnapshot = await db
      .collection("deals")
      .where("dealStatus", "==", status)
      .orderBy("createdAt", "desc")
      .get();

    const deals = dealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    }

    const deal = dealDoc.data();
    const matchedBuyers = deal.matchedBuyers || [];
    const buyerIds = deal.buyerIds || [];

    // If we have buyer IDs, fetch the actual buyer data
    let buyersWithDetails = [];
    if (buyerIds.length > 0) {
      const buyersSnapshot = await db
        .collection("buyers")
        .where(admin.firestore.FieldPath.documentId(), "in", buyerIds)
        .get();

      buyersWithDetails = buyersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    // Merge matched buyers data with actual buyer details
    const enrichedBuyers = matchedBuyers.map((matchedBuyer) => {
      const buyerDetail = buyersWithDetails.find(
        (b) => b.id === matchedBuyer.id
      );
      return {
        ...matchedBuyer,
        ...buyerDetail,
        fitScore: matchedBuyer.matchPercent || 0,
        maxOffer: buyerDetail?.maxOffer || matchedBuyer.maxOffer || 0,
      };
    });

    res.status(200).json({
      dealId: id,
      matchedBuyers: enrichedBuyers,
      buyersCount: deal.buyersCount || 0,
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
    const deals = dealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      buyersCount: doc.data().buyersCount || 0,
      matchedBuyers: doc.data().matchedBuyers || [],
    }));

    res.status(200).json(deals);
  } catch (error) {
    console.error("Error fetching potential buyers count:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOverviewAnalytics = async (req, res) => {
  try {
    // Fetch deals
    const dealsSnapshot = await db.collection("deals").get();
    const deals = dealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch buyers
    const buyersSnapshot = await db.collection("buyers").get();
    const buyers = buyersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalDeals = deals.length;
    const totalBuyers = buyers.length;

    // Calculate total value
    const totalValue = deals.reduce((sum, deal) => {
      let price = 0;
      if (deal.offerPrice) {
        if (typeof deal.offerPrice === "string") {
          price = parseFloat(deal.offerPrice.replace(/[$,]/g, "")) || 0;
        } else if (typeof deal.offerPrice === "number") {
          price = deal.offerPrice;
        } else {
          price = parseFloat(deal.offerPrice) || 0;
        }
      }
      return sum + price;
    }, 0);

    // Conversion Rate
    const closedDeals = deals.filter(
      (deal) => deal.status === "Closed" || deal.status === "Approved"
    ).length;
    const conversionRate =
      totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;

    // Recent Deals (last 3)
    const recentDeals = deals
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 3)
      .map((deal) => ({
        id: deal.id,
        dealId: deal.dealId || deal.mlsNumber || deal.id,
        propertyAddress: deal.propertyAddress || "Address not available",
        offerPrice: deal.offerPrice || "Price not available",
        status: deal.status || "Unknown",
        createdAt: deal.createdAt,
      }));

    // Monthly breakdown (last 12 months)
    const monthlyStats = Array.from({ length: 12 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - index));
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const monthlyDeals = deals.filter((deal) => {
        const dealDate = deal.createdAt?.toDate
          ? deal.createdAt.toDate()
          : new Date(deal.createdAt);
        return (
          dealDate.getMonth() === date.getMonth() &&
          dealDate.getFullYear() === year
        );
      });

      const monthlyValue = monthlyDeals.reduce((sum, deal) => {
        let price = 0;
        if (deal.offerPrice) {
          if (typeof deal.offerPrice === "string") {
            price = parseFloat(deal.offerPrice.replace(/[$,]/g, "")) || 0;
          } else if (typeof deal.offerPrice === "number") {
            price = deal.offerPrice;
          } else {
            price = parseFloat(deal.offerPrice) || 0;
          }
        }
        return sum + price;
      }, 0);

      return {
        month,
        deals: monthlyDeals.length,
        value: monthlyValue,
      };
    });

    // Current & Last Month growth
    const currentMonthDeals = monthlyStats[11].deals;
    const lastMonthDeals = monthlyStats[10].deals;
    const monthlyGrowth =
      lastMonthDeals > 0
        ? `+${Math.round(
            ((currentMonthDeals - lastMonthDeals) / lastMonthDeals) * 100
          )}%`
        : currentMonthDeals > 0
        ? `+${currentMonthDeals} new`
        : "0%";

    res.status(200).json({
      totalDeals,
      totalBuyers,
      totalValue: `$${totalValue.toLocaleString()}`,
      conversionRate: `${conversionRate}%`,
      monthlyGrowth,
      recentDeals,
      monthlyStats, // NEW: for charts
    });
  } catch (error) {
    console.error("Error fetching overview analytics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
