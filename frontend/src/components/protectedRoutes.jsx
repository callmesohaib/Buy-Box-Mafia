import { Navigate, redirect, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // Show loading state while user data is being loaded
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--from-bg)] to-[var(--secondary-gray-bg)] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }
    
    if (!allowedRoles.includes(user.role)) {
        let redirectTo = "/property-search";
        if (user.role === "admin") redirectTo = "/admin";
        else if (user.role === "subadmin") redirectTo = "/subadmin/buyer";
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    return children;
}
