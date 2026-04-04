// Navbar keeps the main MVP routes visible for demo navigation.
import { NavLink } from 'react-router-dom'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Nonprofit Dashboard', to: '/dashboard' },
  { label: 'Volunteer Matches', to: '/matches' },
  { label: 'Volunteer Profile', to: '/volunteers/vol-101' },
  { label: 'Continuity Notes', to: '/continuity-notes' },
]

function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[#fcfaf6]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <NavLink to="/" className="text-2xl font-semibold tracking-tight text-pine">
            BridgeBC
          </NavLink>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Helping nonprofits keep volunteer support steady, even during handoffs.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-pine text-white'
                    : 'bg-white/80 text-slate-700 hover:bg-sky'
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
