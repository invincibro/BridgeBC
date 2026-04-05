// AppLayout provides the shared shell around every routed page.
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function AppLayout() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1480px] lg:flex lg:gap-8 lg:px-6 lg:py-6">
        <Navbar />
        <main className="min-w-0 flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-0 lg:pt-0">
          <div className="mx-auto w-full max-w-[1100px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
