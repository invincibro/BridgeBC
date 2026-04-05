// App.jsx defines the router so each MVP screen has its own route.
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import NonprofitDashboardPage from './pages/NonprofitDashboardPage.jsx'
import OrganizationFormPage from './pages/OrganizationFormPage.jsx'
import VolunteerIntakePage from './pages/VolunteerIntakePage.jsx'
import VolunteerMatchPage from './pages/VolunteerMatchPage.jsx'
import VolunteerProfilePage from './pages/VolunteerProfilePage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<NonprofitDashboardPage />} />
        <Route path="/organizations/new" element={<OrganizationFormPage />} />
        <Route path="/tasks/new" element={<Navigate to="/organizations/new" replace />} />
        <Route path="/volunteers/new" element={<VolunteerIntakePage />} />
        <Route path="/volunteers/dashboard" element={<VolunteerProfilePage />} />
        <Route path="/volunteers/:id" element={<VolunteerProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
