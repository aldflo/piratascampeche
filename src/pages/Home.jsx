function Home() {
  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent" />

        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
              ⚾ Piratas de Campeche
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
              El béisbol de
              <span className="block text-blue-500">
                Campeche en vivo.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              Sigue los partidos, jugadores, estadísticas, resultados y toda
              la información de Piratas desde una sola plataforma.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/live"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold transition hover:bg-blue-500"
              >
                Ver transmisión
              </a>

              <button className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold transition hover:bg-white/10">
                Próximos juegos
              </button>
            </div>
          </div>

          {/* ESCUDO / IMAGEN TEMPORAL */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative flex h-80 w-80 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-2xl">
              <div className="absolute inset-8 rounded-full bg-blue-600/10 blur-3xl" />

              <div className="relative flex h-48 w-48 items-center justify-center rounded-[45px] border border-blue-500/20 bg-blue-600 text-7xl font-black shadow-2xl shadow-blue-600/20">
                P
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMACIÓN PRINCIPAL */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Temporada
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Piratas de Campeche
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            Información principal del equipo, próximos encuentros y
            seguimiento de la temporada.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Próximo partido
            </p>

            <h3 className="mt-4 text-xl font-black">
              Piratas vs Rival
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Próximamente
            </p>

            <div className="mt-6">
              <span className="rounded-xl bg-blue-600/15 px-3 py-2 text-xs font-bold text-blue-400">
                Estadio Nelson Barrera
              </span>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Último resultado
            </p>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="font-black">Piratas</p>
                <p className="text-sm text-slate-500">Campeche</p>
              </div>

              <p className="text-4xl font-black text-blue-400">
                5
              </p>
            </div>

            <div className="my-4 border-t border-white/10" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-black">Rival</p>
                <p className="text-sm text-slate-500">Visitante</p>
              </div>

              <p className="text-4xl font-black">
                3
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-blue-600/15 to-white/[0.02] p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Piratas Live
            </p>

            <h3 className="mt-4 text-2xl font-black">
              Vive cada lanzamiento
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Marcador, alineaciones, estadísticas y transmisión del partido
              actualizados en tiempo real.
            </p>

            <a
              href="/live"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold transition hover:bg-blue-500"
            >
              Ir al juego →
            </a>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Equipo
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Jugadores destacados
            </h2>
          </div>

          <button className="text-sm font-bold text-blue-400">
            Ver roster completo
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["24", "Fernando López", "RF", ".304"],
            ["12", "Luis Hernández", "SS", ".291"],
            ["7", "Carlos Méndez", "CF", ".318"],
            ["33", "Diego Martínez", "1B", ".276"],
          ].map(([number, name, position, average]) => (
            <div
              key={number}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/15 font-black text-blue-400">
                {number}
              </div>

              <h3 className="mt-5 font-black">
                {name}
              </h3>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {position}
                </span>

                <span className="font-bold">
                  {average}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home