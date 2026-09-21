import { NavLink } from "react-router-dom"

function Navbar() {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-white"
      : "text-slate-400 transition hover:text-white"

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070b]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

        {/* LOGO / MARCA */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black shadow-lg shadow-blue-600/20">
            P
          </div>

          <div>
            <h1 className="text-lg font-black tracking-tight">
              PIRATAS LIVE
            </h1>

            <p className="text-xs text-slate-500">
              Baseball Broadcast System
            </p>
          </div>
        </NavLink>

        {/* NAVEGACIÓN */}
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <NavLink
            to="/"
            end
            className={linkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/live"
            className={linkClass}
          >
            En vivo
          </NavLink>

          <NavLink
            to="/alineaciones"
            className={linkClass}
          >
            Alineaciones
          </NavLink>

          <NavLink
            to="/jugadas"
            className={linkClass}
          >
            Jugadas
          </NavLink>

          <NavLink
            to="/calendario"
            className={linkClass}
          >
            Calendario
          </NavLink>
        </nav>

        {/* MESA DE CONTROL */}
        <NavLink
          to="/control"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
        >
          Mesa de control
        </NavLink>
        
  


      </div>
    </header>
  )
}

export default Navbar