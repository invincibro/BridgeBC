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
    <>
      <aside className="hidden lg:block lg:w-[290px] lg:shrink-0">
        <div className="sticky top-6 panel p-6">
          <NavLink to="/" className="block transition duration-200 hover:opacity-90">
            <img src={logo} alt="BridgeBC logo" className="h-12 w-auto" />
          </NavLink>

          <nav className="mt-8 flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-[#fffaf5] text-[#2F3E46] hover:bg-[#f6efe4]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/60 bg-[#fff7ef]/88 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <NavLink to="/" className="shrink-0 transition duration-200 hover:opacity-90">
            <img src={logo} alt="BridgeBC logo" className="h-11 w-auto" />
          </NavLink>

          <nav className="flex gap-2 overflow-x-auto pb-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-white/80 text-[#2F3E46]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}

export default Navbar
