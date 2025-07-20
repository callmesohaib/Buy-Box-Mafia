import { signOut } from "firebase/auth";
import { auth } from "../firebase/client";
import { toast } from "react-hot-toast";

export const handleLogout = async (navigate) => {
  try {
    await signOut(auth);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("uid");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("subadminId");
    if (navigate) {
      navigate("/login");
      toast.success("Logged out successfully");
    } else {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}; 