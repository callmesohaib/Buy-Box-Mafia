require("dotenv").config();
const express = require("express");
const docusignRoutes = require("./routers/docusignRoutes");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routers/authroutes");
const forgotPasswordRoutes = require("./routers/forgotPasswordRoutes");
const subadminRoutes = require("./routers/subadminRoutes");
const buyerRoutes = require("./routers/buyerRoutes");
const dealsRoutes = require("./routers/dealsRoutes");
const { admin } = require("./utils/firebase");
const scoutRoutes = require("./routers/scoutRoutes");

// Initialize Firebase
require("./utils/firebase");
const app = express();

// Middleware
const corOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corOptions));
app.use("/api/docusign", docusignRoutes);


app.use("/api/auth", authRoutes);
app.use("/api/auth", forgotPasswordRoutes);
app.use("/api/subadmin", subadminRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api/scout", scoutRoutes);

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, "public")));

// Error handling for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
});
