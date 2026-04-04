// App.jsx defines the router so each MVP screen has its own route.
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import ContinuityNotesPage from './pages/ContinuityNotesPage.jsx'
import CreateTask from './pages/CreateTask.tsx'
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
        <Route path="/tasks/new" element={<CreateTask />} />
        <Route path="/matches" element={<VolunteerMatchPage />} />
        <Route path="/volunteers/new" element={<VolunteerIntakePage />} />
        <Route path="/volunteers/:id" element={<VolunteerProfilePage />} />
        <Route path="/continuity-notes" element={<ContinuityNotesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
