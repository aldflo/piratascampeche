import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithPopup } from "firebase/auth"

import {
  auth,
  googleProvider,
} from "../firebase.config"

function Login() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const loginWithGoogle = async () => {
    setError("")
    setLoading(true)

    try {
      await signInWithPopup(auth, googleProvider)

      navigate("/control")
    } catch (error) {
      console.error("Error al iniciar sesión:", error)

      if (error.code === "auth/popup-closed-by-user") {
        setError("Cerraste la ventana de inicio de sesión.")
      } else if (error.code === "auth/popup-blocked") {
        setError("El navegador bloqueó la ventana de Google.")
      } else {
        setError("No se pudo iniciar sesión con Google.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-77px)] items-center justify-center overflow-hidden bg-[#05070b] px-5 py-12 text-white">

      {/* FONDO */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/5 blur-[140px]" />
      </div>

      {/* LOGIN */}
      <div className="relative w-full max-w-md">

        <div className="rounded-[32px] border border-white/10 bg-white/[0.035] p-8 shadow-2xl backdrop-blur-xl sm:p-10">

          {/* LOGO */}
          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-blue-600 text-2xl font-black shadow-xl shadow-blue-600/20">
              P
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Piratas Live
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Mesa de control
            </h1>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
              Inicia sesión para administrar partidos y controlar la
              transmisión en vivo.
            </p>

          </div>

          {/* SEPARADOR */}
          <div className="my-8 border-t border-white/10" />

          {/* GOOGLE */}
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {/* LOGO GOOGLE */}
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"
              />

              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.97-.9 6.62-2.39l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"
              />

              <path
                fill="#FBBC05"
                d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.47H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.53l3.35-2.6Z"
              />

              <path
                fill="#EA4335"
                d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.97 2.96 14.7 2 12 2a10 10 0 0 0-8.96 5.47l3.35 2.6C7.18 7.7 9.39 5.94 12 5.94Z"
              />
            </svg>

            {loading
              ? "Conectando con Google..."
              : "Continuar con Google"}
          </button>

          {/* ERROR */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* INFO */}
          <div className="mt-7 rounded-2xl border border-white/5 bg-black/20 p-4">
            <div className="flex gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 17v.01M7 10V8a5 5 0 0 1 10 0v2m-11 0h12a1 1 0 0 1 1 1v9H5v-9a1 1 0 0 1 1-1Z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-300">
                  Acceso administrativo
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Solo usuarios autorizados podrán administrar la transmisión
                  y modificar información del partido.
                </p>
              </div>

            </div>
          </div>

          <p className="mt-7 text-center text-xs text-slate-700">
            Sistema de transmisión deportiva · Piratas Live
          </p>

        </div>

      </div>
    </main>
  )
}

export default Login