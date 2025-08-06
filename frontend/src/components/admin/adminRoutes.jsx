import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "../protectedRoutes";
import Overview from "./Overview"
import DealsTable from "./deal/DealsTable"
import BuyersPanel from "./buyer/BuyersPanel"
import AnalyticsWidgets from "./AnalyticsWidgets"
import BuyerForm from "./buyer/BuyerForm"
import DealMatches from "./deal/DealMatches"
import DealDetail from "./deal/DealDetail"
import AdminDashboard from "../../pages/AdminDashboard"
import SubadminsPanel from "./subadmin/SubadminsPanel"
import SubadminForm from "./subadmin/SubadminForm"
import NotFound from "../../pages/NotFound"

export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={
                <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                </ProtectedRoute>
            }>
                <Route path="/" element={<Overview  />} />
                <Route path="deals" element={<DealsTable  />} />
                <Route path="buyer" element={<BuyersPanel  />} />
                <Route path="analytics" element={<AnalyticsWidgets  />} />
                <Route path="deals/:id" element={<DealMatches />} />
                <Route path="deals/:id/view" element={<DealDetail />} />
                <Route path="buyer/new_buyer" element={<BuyerForm />} />
                <Route path="buyer/edit/:id" element={<BuyerForm />} />
                <Route path="subadmin" element={<SubadminsPanel  />} />
                <Route path="subadmin/new_subadmin" element={<SubadminForm />} />
                <Route path="subadmin/edit/:id" element={<SubadminForm />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}
