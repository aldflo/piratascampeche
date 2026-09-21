import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  connectViewer,
} from "../services/livekitViewerService"


function LiveVideo({ stream }) {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const roomRef = useRef(null)

  const [connected, setConnected] =
    useState(false)

  const [hasVideo, setHasVideo] =
    useState(false)

  const [hasAudio, setHasAudio] =
    useState(false)

  const [error, setError] =
    useState("")


  const isLive =
    stream?.isLive ?? false


  useEffect(() => {
    if (!isLive) {
      return
    }

    let cancelled = false


    async function connect() {
      try {
        setError("")

        const identity =
          `viewer-${crypto.randomUUID()}`

        const room =
          await connectViewer({
            identity,

            onVideoTrack: (
              track
            ) => {
              if (
                cancelled ||
                !videoRef.current
              ) {
                return
              }

              track.attach(
                videoRef.current
              )

              setHasVideo(true)

              videoRef.current
                .play()
                .catch((err) => {
                  console.error(
                    "Error reproduciendo video:",
                    err
                  )
                })
            },

            onAudioTrack: (
              track
            ) => {
              if (
                cancelled ||
                !audioRef.current
              ) {
                return
              }

              track.attach(
                audioRef.current
              )

              setHasAudio(true)

              audioRef.current
                .play()
                .catch((err) => {
                  console.log(
                    "Safari bloqueó autoplay de audio:",
                    err
                  )
                })
            },

            onDisconnected: () => {
              if (cancelled) return

              setConnected(false)
              setHasVideo(false)
              setHasAudio(false)
            },
          })

        if (cancelled) {
          await room.disconnect()
          return
        }

        roomRef.current =
          room

        setConnected(true)

      } catch (err) {
        console.error(
          "Error conectando espectador:",
          err
        )

        setError(
          err?.message ||
            "No se pudo conectar a la transmisión."
        )
      }
    }


    connect()


    return () => {
      cancelled = true

      if (
        roomRef.current
      ) {
        roomRef.current
          .disconnect()
          .catch(console.error)

        roomRef.current =
          null
      }

      setConnected(false)
      setHasVideo(false)
      setHasAudio(false)
    }

  }, [isLive])


  /*
  ==========================================
  STREAM OFFLINE
  ==========================================
  */

  if (!isLive) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-black">

        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 to-black">

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl">
              📡
            </div>

            <p className="mt-5 text-lg font-black text-slate-300">
              Transmisión fuera de línea
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Esperando el inicio del partido.
            </p>

          </div>

        </div>

      </section>
    )
  }


  /*
  ==========================================
  STREAM LIVE
  ==========================================
  */

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-black">

      <div className="relative aspect-video">

        {/* VIDEO REMOTO */}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full bg-black object-contain"
        />


        {/* AUDIO REMOTO */}

        <audio
          ref={audioRef}
          autoPlay
        />


        {/* CARGANDO */}

        {!hasVideo && !error && (

          <div className="absolute inset-0 flex items-center justify-center bg-black">

            <div className="text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

              <p className="mt-5 font-bold text-slate-300">
                Conectando con Piratas Live
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Esperando señal de video...
              </p>

            </div>

          </div>

        )}


        {/* ERROR */}

        {error && (

          <div className="absolute inset-0 flex items-center justify-center bg-black">

            <div className="max-w-md px-6 text-center">

              <div className="text-4xl">
                ⚠️
              </div>

              <p className="mt-4 font-black text-red-400">
                No se pudo conectar
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* LIVE */}

        <div className="absolute left-4 top-4 flex gap-2">

          <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white">
            LIVE
          </span>


          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              connected
                ? "bg-green-500/20 text-green-400"
                : "bg-black/60 text-slate-400"
            }`}
          >
            {connected
              ? "LiveKit conectado"
              : "Conectando"}
          </span>


          {hasAudio && (

            <span className="rounded-full bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-400">
              Audio
            </span>

          )}

        </div>

      </div>

    </section>
  )
}

export default LiveVideo