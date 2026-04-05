// Navbar keeps the main MVP routes visible for demo navigation.
import { NavLink } from 'react-router-dom'
import logo from '../assets/bridgebc-logo.png'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Nonprofit Dashboard', to: '/dashboard' },
  { label: 'Organization Setup', to: '/organizations/new' },
  { label: 'Current Volunteer Need', to: '/tasks/new' },
  { label: 'Volunteer Intake', to: '/volunteers/new' },
  { label: 'Volunteer Dashboard', to: '/volunteers/dashboard' },
]

function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[#fff7ef]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logo} alt="BridgeBC logo" className="h-12 w-auto" />
          </NavLink>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Helping nonprofits keep volunteer support steady, warm, and community-led.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold shadow-soft transition duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-[#fffaf5] text-[#2F3E46] hover:bg-[#eef7ea]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
