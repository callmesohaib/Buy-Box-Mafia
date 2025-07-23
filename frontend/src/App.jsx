import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PropertySearch from "./pages/property_search";
import ValuationResult from "./pages/valuation_result";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContractPreparation from "./pages/ContractPreparation";
import DealSubmission from "./pages/DealSubmission";
import MyDeals from "./pages/MyDeals";
import AdminRoutes from "./components/admin/adminRoutes";
import SubadminRoutes from "./components/admin/SubadminRoutes";
import NotFound from "./pages/NotFound";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/protectedRoutes";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/subadmin");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setUserRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", syncLoginState);
    return () => window.removeEventListener("storage", syncLoginState);
  }, []);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserRole(localStorage.getItem("role"));
  }, [location]);

  // If not logged in, only allow /login and /register
  if (!isLoggedIn) {
    if (location.pathname !== "/login" && location.pathname !== "/register") {
      return <Navigate to="/login" replace />;
    }
    // Hide Navbar/Footer on login/register
    return (
      <main className="flex-1 bg-[#F9FAFB] font-inter min-h-screen">
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Redirect any other route to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  if (
    isLoggedIn &&
    (location.pathname === "/login" || location.pathname === "/register")
  ) {
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    if (userRole === "subadmin")
      return <Navigate to="/subadmin/buyer" replace />;
    return <Navigate to="/property-search" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--primary-gray-bg)] font-inter">
      {!isAdminPage && <Navbar />}
      <main className={`flex-1 ${!isAdminPage ? "pt-16" : ""}`}>
        <ScrollToTop />
        <Routes>
          <Route path="/property-search" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <PropertySearch />
            </ProtectedRoute>
          } />
          <Route
            path="/"
            element={<Navigate to="/property-search" replace />}
          />
          <Route path="/valuation/:id" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <ValuationResult />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contract/:dealId" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <ContractPreparation />
            </ProtectedRoute>
          } />
          <Route path="/submit/:id" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <DealSubmission />
            </ProtectedRoute>
          } />
          <Route path="/deals" element={
            <ProtectedRoute allowedRoles={["scout"]}>
              <MyDeals />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRoutes />
            </ProtectedRoute>
          } />
          <Route path="/subadmin/*" element={
            <ProtectedRoute allowedRoles={["subadmin"]}>
              <SubadminRoutes />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Router>
        <AppContent />
      </Router>
    </>
  );
}
