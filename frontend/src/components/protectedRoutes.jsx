// components/ProtectedRoute.js
import { Navigate, redirect, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const location = useLocation();
    const userRole = localStorage.getItem("role");
    let redirectTo = "/login";
    if (userRole === "scout") redirectTo = "/property-search";
    else if (userRole === "admin") redirectTo = "/admin";
    else if (userRole === "subadmin") redirectTo = "/subadmin/buyer";

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }
    return children;
}