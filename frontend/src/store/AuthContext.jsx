import React, { createContext, useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");
        const id = localStorage.getItem("uid") || localStorage.getItem("userId");
        return name && email && role && id ? { name, email, role, id } : null;
    });
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            const res = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            console.log("Login response:", data);
            if (res.ok && data.success) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("role", data.user.role);
                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.user.name);
                localStorage.setItem("email", data.user.email);
                localStorage.setItem("uid", data.user.id || data.user.uid);
                localStorage.setItem("phone", data.user.phone || "");
                setIsAuthenticated(true);
                setUser({
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                    id: data.user.id || data.user.uid,
                    phone: data.user.phone || "",
                });
                toast.success("Login successful!", { position: "top-center" });
                return true;
            } else {
                toast.error(data.message || "Login failed. Please try again.", { position: "top-center" });
                return false;
            }
        } catch (error) {
            toast.error("Login failed. Please try again.", { position: "top-center" });
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("uid");
        setIsAuthenticated(false);
        setUser(null);
        toast.success("Logged out successfully", { position: "top-center" });
        navigate("/login");
    };

    // ✅ Memoize the context value to prevent re-renders
    const authValue = useMemo(() => ({
        isAuthenticated,
        user,
        login,
        logout,
    }), [isAuthenticated, user]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
