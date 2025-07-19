import { signOut } from "firebase/auth";
import { auth } from "../firebase/client";

export const handleLogout = async (navigate) => {
  try {
    await signOut(auth);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    // Optionally clear other user data
    if (navigate) {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}; 