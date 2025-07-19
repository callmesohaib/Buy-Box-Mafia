import { Routes, Route } from "react-router-dom"
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

export default function AdminRoutes({ analyticsData, deals, buyers }) {
    return (
        <Routes>
            <Route element={<AdminDashboard />}>
                <Route path="/" element={<Overview  />} />
                <Route path="deals" element={<DealsTable  />} />
                <Route path="buyer" element={<BuyersPanel  />} />
                <Route path="analytics" element={<AnalyticsWidgets  />} />
                <Route path="deals/:id" element={<DealMatches />} />
                <Route path="deals/:id/view" element={<DealDetail />} />
                <Route path="buyer/new_buyer" element={<BuyerForm />} />
                <Route path="subadmin" element={<SubadminsPanel  />} />
                <Route path="subadmin/new_subadmin" element={<SubadminForm />} />
            </Route>
        </Routes>
    )
}
