import {
  useEffect,
  useState,
} from "react"

import {
  NavLink,
  useLocation,
} from "react-router-dom"

import piratasLogo from "../assets/logopiratas.jpg"


function Navbar() {
  const [menuOpen, setMenuOpen] =
    useState(false)

  const location =
    useLocation()


  /*
  ==========================================
  CERRAR MENÚ AL CAMBIAR DE RUTA
  ==========================================
  */

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])


  /*
  ==========================================
  BLOQUEAR SCROLL CUANDO MENÚ ESTÁ ABIERTO
  ==========================================
  */

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow =
        "hidden"
    } else {
      document.body.style.overflow =
        ""
    }

    return () => {
      document.body.style.overflow =
        ""
    }
  }, [menuOpen])


  /*
  ==========================================
  LINK DESKTOP
  ==========================================
  */

  const linkClass =
    ({ isActive }) =>
      `
        relative
        flex
        h-full
        items-center
        text-[15px]
        font-bold
        transition-all
        duration-200
        ${
          isActive
            ? "text-yellow-300"
            : "text-white/90 hover:text-yellow-300"
        }
      `


  return (
    <>
      {/* =====================================
          NAVBAR
      ===================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/10
          bg-black
        "
      >

        <div
          className="
            mx-auto
            flex
            h-[86px]
            max-w-[1280px]
            items-center
            justify-between
            px-4
            sm:px-6
            lg:h-[98px]
            lg:px-8
          "
        >

          {/* =================================
              LOGO
          ================================= */}

          <NavLink
            to="/"
            className="
              flex
              h-full
              shrink-0
              items-center
            "
          >

            <div
              className="
                flex
                h-[68px]
                w-[94px]
                items-center
                justify-center
                overflow-hidden
                sm:h-[72px]
                sm:w-[105px]
                lg:h-[82px]
                lg:w-[120px]
              "
            >

              <img
                src={piratasLogo}
                alt="Piratas"
                className="
                  h-full
                  w-full
                  object-contain
                  mix-blend-screen
                "
              />

            </div>

          </NavLink>


          {/* =================================
              NAVEGACIÓN DESKTOP
          ================================= */}

          <nav
            className="
              hidden
              h-full
              items-center
              gap-8
              lg:flex
            "
          >

            <NavLink
              to="/"
              end
              className={
                linkClass
              }
            >
              Home
            </NavLink>


            <NavLink
              to="/live"
              className={
                linkClass
              }
            >
              En vivo
            </NavLink>


            <NavLink
              to="/alineaciones"
              className={
                linkClass
              }
            >
              Alineaciones
            </NavLink>


            <NavLink
              to="/jugadas"
              className={
                linkClass
              }
            >
              Jugadas
            </NavLink>


            <NavLink
              to="/calendario"
              className={
                linkClass
              }
            >
              Calendario
            </NavLink>

          </nav>


          {/* =================================
              DERECHA DESKTOP
          ================================= */}

          <div
            className="
              hidden
              items-center
              gap-3
              lg:flex
            "
          >

            {/* LIVE */}

            <NavLink
              to="/live"
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-red-500/30
                bg-red-500/10
                px-4
                py-2.5
                text-[11px]
                font-black
                uppercase
                tracking-[0.15em]
                text-red-400
                transition
                hover:bg-red-500/20
              "
            >

              <span
                className="
                  h-2
                  w-2
                  animate-pulse
                  rounded-full
                  bg-red-500
                "
              />

              Live

            </NavLink>


            {/* CONTROL */}

            <NavLink
              to="/control"
              className="
                rounded-xl
                border
                border-yellow-300/25
                bg-yellow-300
                px-5
                py-2.5
                text-sm
                font-black
                text-black
                transition
                hover:bg-yellow-200
              "
            >
              Mesa de control
            </NavLink>

          </div>


          {/* =================================
              HAMBURGUESA
          ================================= */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (value) =>
                  !value
              )
            }
            aria-label={
              menuOpen
                ? "Cerrar menú"
                : "Abrir menú"
            }
            aria-expanded={
              menuOpen
            }
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-white/15
              bg-white/[0.04]
              text-white
              transition
              active:scale-95
              lg:hidden
            "
          >

            <div
              className="
                relative
                h-5
                w-6
              "
            >

              <span
                className={`
                  absolute
                  left-0
                  top-0
                  h-[2px]
                  w-6
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  ${
                    menuOpen
                      ? "translate-y-[9px] rotate-45"
                      : ""
                  }
                `}
              />


              <span
                className={`
                  absolute
                  left-0
                  top-[9px]
                  h-[2px]
                  w-6
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  ${
                    menuOpen
                      ? "opacity-0"
                      : "opacity-100"
                  }
                `}
              />


              <span
                className={`
                  absolute
                  bottom-0
                  left-0
                  h-[2px]
                  w-6
                  rounded-full
                  bg-white
                  transition-all
                  duration-300
                  ${
                    menuOpen
                      ? "-translate-y-[9px] -rotate-45"
                      : ""
                  }
                `}
              />

            </div>

          </button>

        </div>

      </header>


      {/* =====================================
          OVERLAY MÓVIL
      ===================================== */}

      <div
        onClick={() =>
          setMenuOpen(false)
        }
        className={`
          fixed
          inset-0
          z-40
          bg-black/80
          backdrop-blur-sm
          transition-opacity
          duration-300
          lg:hidden
          ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />


      {/* =====================================
          MENÚ MÓVIL
      ===================================== */}

      <aside
        className={`
          fixed
          right-0
          top-[86px]
          z-50
          h-[calc(100dvh-86px)]
          w-[88%]
          max-w-[360px]
          overflow-y-auto
          border-l
          border-white/10
          bg-black
          p-5
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          lg:hidden
          ${
            menuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >

        {/* LOGO MOBILE */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-center
            border-b
            border-white/10
            pb-5
          "
        >

          <img
            src={piratasLogo}
            alt="Piratas"
            className="
              h-[90px]
              w-[140px]
              object-contain
              mix-blend-screen
            "
          />

        </div>


        {/* LIVE */}

        <NavLink
          to="/live"
          className="
            mb-5
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            p-4
          "
        >

          <div>

            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-red-400
              "
            >
              Piratas Live
            </p>


            <p
              className="
                mt-1
                text-sm
                font-black
                text-white
              "
            >
              Ver transmisión
            </p>

          </div>


          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-red-500/15
            "
          >

            <span
              className="
                h-3
                w-3
                animate-pulse
                rounded-full
                bg-red-500
              "
            />

          </div>

        </NavLink>


        {/* =================================
            LINKS MOBILE
        ================================= */}

        <nav className="space-y-1">

          <MobileNavItem
            to="/"
            label="Home"
          />

          <MobileNavItem
            to="/live"
            label="En vivo"
          />

          <MobileNavItem
            to="/alineaciones"
            label="Alineaciones"
          />

          <MobileNavItem
            to="/jugadas"
            label="Jugadas"
          />

          <MobileNavItem
            to="/calendario"
            label="Calendario"
          />

        </nav>


        <div
          className="
            my-5
            h-px
            bg-white/10
          "
        />


        {/* CONTROL MOBILE */}

        <NavLink
          to="/control"
          className="
            flex
            min-h-[54px]
            w-full
            items-center
            justify-center
            rounded-2xl
            bg-yellow-300
            px-5
            py-3
            text-sm
            font-black
            text-black
            transition
            active:scale-[0.98]
          "
        >
          Mesa de control
        </NavLink>


        <p
          className="
            mt-6
            text-center
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-white/25
          "
        >
          Piratas de Campeche
        </p>

      </aside>
    </>
  )
}


/*
==========================================
LINK MOBILE
==========================================
*/

function MobileNavItem({
  to,
  label,
}) {
  return (
    <NavLink
      to={to}
      end={
        to === "/"
      }
      className={({
        isActive,
      }) =>
        `
          relative
          flex
          min-h-[54px]
          items-center
          border-b
          border-white/[0.07]
          px-2
          text-base
          font-bold
          transition
          ${
            isActive
              ? "text-yellow-300"
              : "text-white/80 hover:text-yellow-300"
          }
        `
      }
    >

      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="
                mr-3
                h-2
                w-2
                rounded-full
                bg-yellow-300
              "
            />
          )}

          {label}
        </>
      )}

    </NavLink>
  )
}


export default Navbar