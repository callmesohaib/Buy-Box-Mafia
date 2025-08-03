import { Navigate, redirect, useLocation } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    if (!allowedRoles.includes(user.role)) {
        let redirectTo = "/property-search";
        if (user.role === "admin") redirectTo = "/admin";
        else if (user.role === "subadmin") redirectTo = "/subadmin/buyer";
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    return children;
}
