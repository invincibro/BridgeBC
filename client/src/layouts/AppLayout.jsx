// AppLayout provides the shared shell around every routed page.
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
