import { useEffect, useState } from "react"

import LiveVideo from "../components/LiveVideo"

import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../firebase.config"
import { subscribeToCurrentStream } from "../services/streamService"


function StatusDot({ active, color = "green" }) {
  const colors = {
    green: active
      ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]"
      : "bg-slate-700",

    red: active
      ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.9)]"
      : "bg-slate-700",

    blue: active
      ? "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,.8)]"
      : "bg-slate-700",
  }

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full transition-all duration-300 ${
        colors[color]
      }`}
    />
  )
}


function CountLights({
  value = 0,
  max = 3,
  activeClass = "bg-emerald-400",
}) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }).map((_, index) => (
        <span
          key={index}
          className={`h-3 w-3 rounded-full border transition-all duration-300 ${
            index < value
              ? `${activeClass} border-transparent shadow-sm`
              : "border-white/15 bg-white/[0.04]"
          }`}
        />
      ))}
    </div>
  )
}


function Live() {
  const [stream, setStream] = useState(null)

  const [marcador, setMarcador] = useState({
    local: "Piratas",
    visitante: "Visitante",
    carrerasLocal: 0,
    carrerasVisitante: 0,
    bolas: 0,
    strikes: 0,
    outs: 0,
    inning: 1,
    parte: "alta",
  })

  useEffect(() => {
    const unsubscribeStream = subscribeToCurrentStream((streamData) => {
      setStream(streamData)
    })

    const marcadorRef = doc(db, "transmisiones", "partido_actual")

    const unsubscribeMarcador = onSnapshot(
      marcadorRef,
      (snapshot) => {
        if (!snapshot.exists()) return

        setMarcador((actual) => ({
          ...actual,
          ...snapshot.data(),
        }))
      },
      (error) => {
        console.error("Error leyendo marcador en Live:", error)
      }
    )

    return () => {
      unsubscribeStream()
      unsubscribeMarcador()
    }
  }, [])


  const isLive = stream?.isLive || false
  const cameraEnabled = stream?.cameraEnabled || false
  const micEnabled = stream?.micEnabled || false

  const equipoBateando =
    marcador.parte === "alta"
      ? marcador.visitante
      : marcador.local

  // Un solo origen de verdad para el marcador:
  // transmisiones/partido_actual
  const game = {
    awayTeam: marcador.visitante,
    homeTeam: marcador.local,
    awayScore: marcador.carrerasVisitante,
    homeScore: marcador.carrerasLocal,
    balls: marcador.bolas,
    strikes: marcador.strikes,
    outs: marcador.outs,
    inning: marcador.inning,
    inningHalf: marcador.parte === "alta" ? "top" : "bottom",
    batter: equipoBateando,
  }


  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">

      {/* =====================================================
          FONDO
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute -right-40 top-[350px] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />

        <div
          className="
            absolute inset-0
            bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)]
            bg-[size:45px_45px]
          "
        />

      </div>


      {/* =====================================================
          CONTENEDOR
      ===================================================== */}

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-3">

              <span
                className={`relative flex h-3 w-3 ${
                  isLive ? "" : "opacity-50"
                }`}
              >
                {isLive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                )}

                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    isLive
                      ? "bg-red-500"
                      : "bg-slate-600"
                  }`}
                />
              </span>


              <span
                className={`text-[11px] font-black uppercase tracking-[0.3em] ${
                  isLive
                    ? "text-red-400"
                    : "text-slate-500"
                }`}
              >
                {isLive
                  ? "Transmisión en vivo"
                  : "Transmisión fuera de línea"}
              </span>

            </div>


            <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-[42px]">
              {stream?.title || "Piratas Live"}
            </h1>


            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {stream?.description ||
                "Transmisión oficial y seguimiento del partido en tiempo real."}
            </p>

          </div>



          {/* ESTADO TÉCNICO */}

          <div
            className="
              flex flex-wrap items-center gap-2
              rounded-2xl
              border border-white/[0.08]
              bg-white/[0.035]
              p-2
              shadow-2xl
              backdrop-blur-xl
            "
          >

            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5">
              <StatusDot active={isLive} color="red" />

              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                  Señal
                </p>

                <p className="text-xs font-bold text-slate-300">
                  {isLive ? "ON AIR" : "OFFLINE"}
                </p>
              </div>
            </div>


            <div className="h-8 w-px bg-white/[0.07]" />


            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5">

              <StatusDot
                active={cameraEnabled}
                color="blue"
              />

              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                  Cámara
                </p>

                <p
                  className={`text-xs font-bold ${
                    cameraEnabled
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  {cameraEnabled
                    ? "Activa"
                    : "Apagada"}
                </p>
              </div>

            </div>


            <div className="h-8 w-px bg-white/[0.07]" />


            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5">

              <StatusDot
                active={micEnabled}
                color="green"
              />

              <div>

                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                  Audio
                </p>

                <p
                  className={`text-xs font-bold ${
                    micEnabled
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  {micEnabled
                    ? "Activo"
                    : "Silenciado"}
                </p>

              </div>

            </div>

          </div>

        </header>



        {/* ===================================================
            MARCADOR COMPACTO — FUERA DEL VIDEO
        =================================================== */}

        <section
          className="
            mb-3
            overflow-hidden
            md:hidden
            rounded-2xl
            border border-white/[0.08]
            bg-white/[0.04]
            shadow-xl
            backdrop-blur-xl
          "
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
                Visitante
              </p>
              <p className="truncate text-sm font-black text-white sm:text-base">
                {marcador.visitante}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-2xl font-black text-white sm:text-3xl">
                {marcador.carrerasVisitante}
              </span>

              <span className="text-xs font-black text-slate-600">
                -
              </span>

              <span className="text-2xl font-black text-yellow-300 sm:text-3xl">
                {marcador.carrerasLocal}
              </span>
            </div>

            <div className="min-w-0 text-right">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-500">
                Local
              </p>
              <p className="truncate text-sm font-black text-yellow-300 sm:text-base">
                {marcador.local}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-2 text-[10px] font-black sm:px-5 sm:text-xs">
            <span className="text-yellow-300">
              {marcador.parte === "alta" ? "▲" : "▼"} {marcador.inning}ª
            </span>

            <span className="min-w-0 truncate text-slate-400">
              Batea: <span className="text-white">{equipoBateando}</span>
            </span>

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-emerald-300">B {marcador.bolas}</span>
              <span className="text-yellow-300">S {marcador.strikes}</span>
              <span className="text-red-300">O {marcador.outs}</span>
            </div>
          </div>
        </section>


        {/* ===================================================
            VIDEO
        =================================================== */}

        <section
          className="
            relative
            mx-auto
            w-full
            max-w-[1100px]
            overflow-hidden
            rounded-[24px]
            border border-white/[0.08]
            bg-black
            shadow-[0_35px_100px_-40px_rgba(0,0,0,1)]
            sm:rounded-[28px]
          "
        >

          {/* BADGE EN VIVO */}

          {isLive && (
            <div
              className="
                pointer-events-none
                absolute left-3 top-3 z-20
                flex items-center gap-2
                rounded-lg
                bg-red-600
                px-2.5 py-1.5
                shadow-lg
                sm:left-5 sm:top-5
                sm:px-3 sm:py-2
              "
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />

              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white">
                En vivo
              </span>
            </div>
          )}


          <LiveVideo stream={stream} />

        </section>



        {/* ===================================================
            INFORMACIÓN INFERIOR
        =================================================== */}

        {game ? (

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_330px]">


            {/* ===============================================
                MARCADOR PRINCIPAL
            =============================================== */}

            <section
              className="
                overflow-hidden
                rounded-[28px]
                border border-white/[0.08]
                bg-gradient-to-br
                from-white/[0.055]
                to-white/[0.018]
                shadow-2xl
                backdrop-blur-xl
              "
            >

              {/* CABECERA MARCADOR */}

              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Marcador
                  </p>
                </div>


                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-white/[0.08]
                    bg-black/30
                    px-4 py-2
                  "
                >

                  <span className="text-xs font-bold text-slate-500">
                    INNING
                  </span>

                  <span className="text-sm font-black">
                    {game.inning}
                  </span>

                  <span className="text-blue-400">
                    {game.inningHalf === "top"
                      ? "▲"
                      : "▼"}
                  </span>

                </div>

              </div>



              {/* EQUIPOS */}

              <div
                className="
                  grid items-center gap-6
                  px-6 py-8
                  md:grid-cols-[1fr_auto_1fr]
                  lg:px-10
                "
              >

                {/* VISITANTE */}

                <div className="text-center md:text-right">

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Visitante
                  </p>

                  <h2 className="text-xl font-black sm:text-2xl">
                    {game.awayTeam || "Visitante"}
                  </h2>

                </div>



                {/* SCORE */}

                <div
                  className="
                    flex items-center justify-center gap-6
                    rounded-[24px]
                    border border-white/[0.08]
                    bg-black/30
                    px-7 py-5
                    sm:px-10
                  "
                >

                  <span className="min-w-[50px] text-center text-5xl font-black tracking-tighter sm:text-6xl">
                    {game.awayScore ?? 0}
                  </span>


                  <div className="flex flex-col items-center gap-1">

                    <div className="h-7 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                    <span className="text-xs font-black text-slate-700">
                      VS
                    </span>

                    <div className="h-7 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                  </div>


                  <span
                    className="
                      min-w-[50px]
                      text-center
                      text-5xl
                      font-black
                      tracking-tighter
                      text-blue-400
                      sm:text-6xl
                    "
                  >
                    {game.homeScore ?? 0}
                  </span>

                </div>



                {/* LOCAL */}

                <div className="text-center md:text-left">

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Local
                  </p>

                  <h2 className="text-xl font-black sm:text-2xl">
                    {game.homeTeam || "Local"}
                  </h2>

                </div>

              </div>



              {/* PARTE INFERIOR */}

              <div
                className="
                  grid gap-0
                  border-t border-white/[0.07]
                  sm:grid-cols-3
                "
              >

                {/* CONTEO */}

                <div className="border-b border-white/[0.07] p-5 sm:border-b-0 sm:border-r">

                  <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
                    Conteo
                  </p>


                  <div className="space-y-3">

                    <div className="flex items-center justify-between gap-4">

                      <span className="text-xs font-bold text-slate-500">
                        B
                      </span>

                      <CountLights
                        value={game.balls || 0}
                        max={4}
                        activeClass="bg-emerald-400"
                      />

                    </div>


                    <div className="flex items-center justify-between gap-4">

                      <span className="text-xs font-bold text-slate-500">
                        S
                      </span>

                      <CountLights
                        value={game.strikes || 0}
                        max={3}
                        activeClass="bg-amber-400"
                      />

                    </div>


                    <div className="flex items-center justify-between gap-4">

                      <span className="text-xs font-bold text-slate-500">
                        O
                      </span>

                      <CountLights
                        value={game.outs || 0}
                        max={3}
                        activeClass="bg-red-500"
                      />

                    </div>

                  </div>

                </div>



                {/* INNING */}

                <div className="border-b border-white/[0.07] p-5 sm:border-b-0 sm:border-r">

                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
                    Entrada
                  </p>

                  <div className="mt-3 flex items-baseline gap-2">

                    <span className="text-3xl font-black">
                      {game.inning || 1}
                    </span>

                    <span className="text-lg text-blue-400">
                      {game.inningHalf === "top"
                        ? "▲"
                        : "▼"}
                    </span>

                  </div>

                </div>



                {/* AL BATE */}

                <div className="p-5">

                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
                    Al bate
                  </p>

                  <p className="mt-3 truncate text-lg font-black">
                    {game.batter || "Por definir"}
                  </p>

                </div>

              </div>

            </section>



            {/* ===============================================
                PANEL LATERAL
            =============================================== */}

            <aside className="space-y-5">

              {/* PARTIDO */}

              <div
                className="
                  rounded-[26px]
                  border border-white/[0.08]
                  bg-white/[0.035]
                  p-5
                  backdrop-blur-xl
                "
              >

                <div className="mb-5 flex items-center justify-between">

                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                    Partido
                  </p>

                  {isLive && (
                    <span className="rounded-md bg-red-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-red-400">
                      Live
                    </span>
                  )}

                </div>


                <div className="space-y-4">

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Entrada
                    </span>

                    <span className="font-bold">
                      {game.inning}
                      {game.inningHalf === "top"
                        ? " ▲"
                        : " ▼"}
                    </span>
                  </div>


                  <div className="h-px bg-white/[0.06]" />


                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Outs
                    </span>

                    <span className="font-bold">
                      {game.outs ?? 0}
                    </span>

                  </div>


                  <div className="h-px bg-white/[0.06]" />


                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Conteo
                    </span>

                    <span className="font-bold">
                      {game.balls ?? 0}
                      {" - "}
                      {game.strikes ?? 0}
                    </span>

                  </div>

                </div>

              </div>



              {/* SISTEMA */}

              <div
                className="
                  rounded-[26px]
                  border border-white/[0.08]
                  bg-white/[0.035]
                  p-5
                  backdrop-blur-xl
                "
              >

                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                  Estado de transmisión
                </p>


                <div className="space-y-4">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <StatusDot
                        active={cameraEnabled}
                        color="blue"
                      />

                      <span className="text-sm text-slate-400">
                        Cámara
                      </span>

                    </div>

                    <span
                      className={`text-xs font-bold ${
                        cameraEnabled
                          ? "text-emerald-400"
                          : "text-slate-600"
                      }`}
                    >
                      {cameraEnabled
                        ? "ACTIVA"
                        : "OFF"}
                    </span>

                  </div>


                  <div className="h-px bg-white/[0.06]" />


                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <StatusDot
                        active={micEnabled}
                        color="green"
                      />

                      <span className="text-sm text-slate-400">
                        Micrófono
                      </span>

                    </div>

                    <span
                      className={`text-xs font-bold ${
                        micEnabled
                          ? "text-emerald-400"
                          : "text-slate-600"
                      }`}
                    >
                      {micEnabled
                        ? "ACTIVO"
                        : "OFF"}
                    </span>

                  </div>


                  <div className="h-px bg-white/[0.06]" />


                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <StatusDot
                        active={isLive}
                        color="red"
                      />

                      <span className="text-sm text-slate-400">
                        Stream
                      </span>

                    </div>

                    <span
                      className={`text-xs font-bold ${
                        isLive
                          ? "text-red-400"
                          : "text-slate-600"
                      }`}
                    >
                      {isLive
                        ? "EN VIVO"
                        : "OFFLINE"}
                    </span>

                  </div>

                </div>

              </div>

            </aside>

          </div>

        ) : (

          /* =================================================
              SIN PARTIDO
          ================================================= */

          <section
            className="
              mt-5
              flex min-h-[180px]
              items-center justify-center
              rounded-[26px]
              border border-white/[0.08]
              bg-white/[0.025]
              text-center
            "
          >

            <div>

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                <span className="text-xl">
                  ⚾
                </span>
              </div>

              <p className="font-bold text-slate-300">
                No hay partido activo
              </p>

              <p className="mt-1 text-sm text-slate-600">
                El marcador aparecerá automáticamente al iniciar un juego.
              </p>

            </div>

          </section>

        )}

      </div>

    </main>
  )
}

export default Live