import { Link } from "react-router-dom"
import piratasLogo from "../assets/piratas-logo.png"

function Home() {
  const featuredPlayers = [
    ["24", "Fernando López", "RF", ".304"],
    ["12", "Luis Hernández", "SS", ".291"],
    ["7", "Carlos Méndez", "CF", ".318"],
    ["33", "Diego Martínez", "1B", ".276"],
  ]

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-yellow-400/15">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/10 via-transparent to-white/5" />

        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-yellow-300/10 blur-[110px]" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-white/5 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-5 sm:py-16 lg:min-h-[560px] lg:grid-cols-2 lg:px-8 lg:py-20">
          {/* TEXTO */}
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-300 sm:text-xs">
              ⚾ Piratas de Campeche
            </div>

            <h1 className="mx-auto max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:mx-0 lg:text-7xl">
              El béisbol de
              <span className="mt-1 block text-yellow-300">
                Campeche en vivo.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 lg:mx-0">
              Sigue los partidos, jugadores, estadísticas, resultados y toda
              la información de Piratas desde una sola plataforma.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Link
                to="/live"
                className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-200 active:scale-[0.98]"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
                Ver transmisión
              </Link>

              <Link
                to="/calendario"
                className="flex min-h-[50px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Próximos juegos
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-slate-400 lg:justify-start">
              <span>● Transmisión en vivo</span>
              <span>● Marcador en tiempo real</span>
              <span>● Estadísticas</span>
            </div>
          </div>

          {/* LOGO */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative flex w-full max-w-[430px] items-center justify-center rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-yellow-300/5 p-6 shadow-2xl shadow-yellow-300/10 sm:p-8">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-yellow-300/10 via-transparent to-white/5" />

              <img
                src={piratasLogo}
                alt="Logo de Piratas"
                className="relative z-10 w-full max-w-[340px] rounded-2xl object-contain"
              />

              <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-yellow-300/20 bg-black/80 px-4 py-2 shadow-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-300" />
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300">
                  Piratas Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMACIÓN PRINCIPAL */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-5 sm:py-14 lg:px-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
            Temporada
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Piratas de Campeche
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Información principal del equipo, próximos encuentros y
            seguimiento de la temporada.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* PRÓXIMO PARTIDO */}
          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Próximo partido
            </p>

            <h3 className="mt-4 text-xl font-black text-white">
              Piratas vs Rival
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Próximamente
            </p>

            <div className="mt-6">
              <span className="inline-flex rounded-xl bg-yellow-300/15 px-3 py-2 text-xs font-bold text-yellow-300">
                Estadio Nelson Barrera
              </span>
            </div>
          </div>

          {/* ÚLTIMO RESULTADO */}
          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Último resultado
            </p>

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white">Piratas</p>
                <p className="text-sm text-slate-400">Campeche</p>
              </div>

              <p className="text-4xl font-black text-yellow-300">
                5
              </p>
            </div>

            <div className="my-4 border-t border-white/10" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white">Rival</p>
                <p className="text-sm text-slate-400">Visitante</p>
              </div>

              <p className="text-4xl font-black text-white">
                3
              </p>
            </div>
          </div>

          {/* PIRATAS LIVE */}
          <div className="rounded-[26px] border border-yellow-300/20 bg-gradient-to-br from-yellow-300/10 to-white/[0.03] p-5 shadow-lg shadow-yellow-300/10 md:col-span-2 sm:p-6 xl:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">
              Piratas Live
            </p>

            <h3 className="mt-4 text-2xl font-black text-white">
              Vive cada lanzamiento
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Marcador, alineaciones, estadísticas y transmisión del partido
              actualizados en tiempo real.
            </p>

            <Link
              to="/live"
              className="mt-6 inline-flex min-h-[46px] items-center rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-200"
            >
              Ir al juego →
            </Link>
          </div>
        </div>
      </section>

     
      {/* CTA FINAL */}
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-5 sm:py-16 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
            Piratas Live
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
            Todo el juego en un solo lugar.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Transmisión, marcador, jugadas, alineaciones y calendario desde
            cualquier dispositivo.
          </p>

          <Link
            to="/live"
            className="mt-7 inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-yellow-300 px-6 py-3 text-sm font-black text-black transition hover:bg-yellow-200"
          >
            Entrar a Piratas Live
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Home