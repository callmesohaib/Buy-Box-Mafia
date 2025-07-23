import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "../protectedRoutes";
import BuyersPanel from "./buyer/BuyersPanel"
import BuyerForm from "./buyer/BuyerForm"
import AdminDashboard from "../../pages/AdminDashboard"
import NotFound from "../../pages/NotFound"

export default function SubadminRoutes() {
    return (
        <Routes>
            <Route element={
                <ProtectedRoute allowedRoles={["subadmin"]}>
                    <AdminDashboard />
                </ProtectedRoute>
            }>
                <Route path="buyer" element={<BuyersPanel />} />
                <Route path="buyer/new_buyer" element={<BuyerForm />} />
                <Route path="buyer/edit/:id" element={<BuyerForm />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
} 