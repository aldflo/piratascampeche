import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  RoomEvent,
} from "livekit-client"

import {
  connectViewer,
} from "../services/livekitViewerService"


function LiveVideo({ stream }) {
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const playerRef = useRef(null)
  const roomRef = useRef(null)


  const [connected, setConnected] =
    useState(false)

  const [hasVideo, setHasVideo] =
    useState(false)

  const [hasAudio, setHasAudio] =
    useState(false)

  const [
    audioBlocked,
    setAudioBlocked,
  ] = useState(false)

  const [
    activatingAudio,
    setActivatingAudio,
  ] = useState(false)

  const [
    audioMuted,
    setAudioMuted,
  ] = useState(false)

  const [
    viewerCount,
    setViewerCount,
  ] = useState(0)

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false)

  const [
    isPictureInPicture,
    setIsPictureInPicture,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState("")


  const isLive =
    stream?.isLive ?? false


  /*
  ==========================================
  ACTIVAR AUDIO
  ==========================================
  */

  const handleEnableAudio =
    async () => {
      if (!roomRef.current) {
        return
      }

      setActivatingAudio(true)

      setError("")

      try {
        await roomRef.current.startAudio()


        if (audioRef.current) {
          audioRef.current.muted =
            false

          await audioRef.current.play()
        }


        setAudioMuted(false)

        setAudioBlocked(false)

        setHasAudio(true)
      } catch (err) {
        console.error(
          "Error activando audio:",
          err
        )

        setError(
          "No se pudo activar el audio. Toca nuevamente el botón."
        )
      } finally {
        setActivatingAudio(false)
      }
    }


  /*
  ==========================================
  SILENCIAR / ACTIVAR AUDIO
  ==========================================
  */

  const toggleAudio =
    async () => {
      if (
        audioBlocked
      ) {
        await handleEnableAudio()

        return
      }


      if (
        !audioRef.current
      ) {
        return
      }


      const nextMuted =
        !audioMuted


      audioRef.current.muted =
        nextMuted


      setAudioMuted(
        nextMuted
      )


      if (!nextMuted) {
        try {
          await audioRef.current.play()
        } catch (err) {
          console.log(
            "El navegador requiere interacción para reproducir audio:",
            err
          )

          setAudioBlocked(
            true
          )
        }
      }
    }


  /*
  ==========================================
  PANTALLA COMPLETA
  ==========================================
  */

  const toggleFullscreen =
    async () => {
      try {
        /*
        Salir de pantalla completa
        */

        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen()

          return
        }


        /*
        Chrome, Android, Desktop,
        Safari moderno
        */

        if (
          playerRef.current
            ?.requestFullscreen
        ) {
          await playerRef.current
            .requestFullscreen()

          return
        }


        /*
        Safari alternativo
        */

        if (
          playerRef.current
            ?.webkitRequestFullscreen
        ) {
          playerRef.current
            .webkitRequestFullscreen()

          return
        }


        /*
        iPhone Safari:
        pantalla completa directamente
        sobre el elemento video.
        */

        if (
          videoRef.current
            ?.webkitEnterFullscreen
        ) {
          videoRef.current
            .webkitEnterFullscreen()

          return
        }


        setError(
          "La pantalla completa no está disponible en este navegador."
        )
      } catch (err) {
        console.error(
          "Error pantalla completa:",
          err
        )
      }
    }


  /*
  ==========================================
  PICTURE IN PICTURE
  ==========================================
  */

  const togglePictureInPicture =
    async () => {
      const video =
        videoRef.current


      if (!video) {
        return
      }


      try {
        /*
        Salir PiP estándar
        */

        if (
          document.pictureInPictureElement
        ) {
          await document
            .exitPictureInPicture()

          return
        }


        /*
        Chrome / Edge / navegadores
        compatibles
        */

        if (
          document
            .pictureInPictureEnabled &&
          video.requestPictureInPicture
        ) {
          await video
            .requestPictureInPicture()

          return
        }


        /*
        Safari
        */

        if (
          typeof video
            .webkitSetPresentationMode ===
            "function"
        ) {
          const nextMode =
            isPictureInPicture
              ? "inline"
              : "picture-in-picture"


          video
            .webkitSetPresentationMode(
              nextMode
            )

          setIsPictureInPicture(
            nextMode ===
              "picture-in-picture"
          )

          return
        }


        setError(
          "Picture-in-Picture no está disponible en este dispositivo."
        )
      } catch (err) {
        console.error(
          "Error Picture-in-Picture:",
          err
        )
      }
    }


  /*
  ==========================================
  ESCUCHAR FULLSCREEN
  ==========================================
  */

  useEffect(() => {
    const handleFullscreenChange =
      () => {
        setIsFullscreen(
          Boolean(
            document.fullscreenElement
          )
        )
      }


    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    )


    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      )
    }
  }, [])


  /*
  ==========================================
  EVENTOS PICTURE IN PICTURE
  ==========================================
  */

  useEffect(() => {
    const video =
      videoRef.current


    if (!video) {
      return
    }


    const handleEnter =
      () => {
        setIsPictureInPicture(
          true
        )
      }


    const handleLeave =
      () => {
        setIsPictureInPicture(
          false
        )
      }


    video.addEventListener(
      "enterpictureinpicture",
      handleEnter
    )


    video.addEventListener(
      "leavepictureinpicture",
      handleLeave
    )


    return () => {
      video.removeEventListener(
        "enterpictureinpicture",
        handleEnter
      )

      video.removeEventListener(
        "leavepictureinpicture",
        handleLeave
      )
    }
  }, [
    hasVideo,
  ])


  /*
  ==========================================
  CONECTAR ESPECTADOR
  ==========================================
  */

  useEffect(() => {
    if (!isLive) {
      setViewerCount(0)

      return
    }


    let cancelled =
      false

    let activeRoom =
      null


    /*
    ========================================
    CONTADOR DE ESPECTADORES

    Con un administrador transmitiendo:
    remoteParticipants.size coincide con
    el total de espectadores desde la
    perspectiva de cada viewer.

    Viewer 1:
      admin = 1 remoto
      espectadores = 1

    Viewer 2:
      admin + viewer1 = 2 remotos
      espectadores = 2
    ========================================
    */

    const updateViewerCount =
      () => {
        if (
          cancelled ||
          !activeRoom
        ) {
          return
        }


        setViewerCount(
          activeRoom
            .remoteParticipants
            .size
        )
      }


    async function connect() {
      try {
        setError("")

        setAudioBlocked(
          false
        )


        const identity =
          `viewer-${crypto.randomUUID()}`


        const room =
          await connectViewer({
            identity,


            /*
            ======================================
            VIDEO
            ======================================
            */

            onVideoTrack: (
              track
            ) => {
              if (
                cancelled ||
                !videoRef.current
              ) {
                return
              }


              track.detach()


              track.attach(
                videoRef.current
              )


              setHasVideo(
                true
              )


              videoRef.current
                .play()
                .catch(
                  (err) => {
                    console.error(
                      "Error reproduciendo video:",
                      err
                    )
                  }
                )
            },


            /*
            ======================================
            AUDIO
            ======================================
            */

            onAudioTrack: (
              track
            ) => {
              if (
                cancelled ||
                !audioRef.current
              ) {
                return
              }


              track.detach()


              track.attach(
                audioRef.current
              )


              setHasAudio(
                true
              )


              audioRef.current
                .play()
                .then(() => {
                  setAudioBlocked(
                    false
                  )

                  setAudioMuted(
                    false
                  )
                })
                .catch(
                  (err) => {
                    console.log(
                      "Autoplay de audio bloqueado:",
                      err
                    )

                    setAudioBlocked(
                      true
                    )
                  }
                )
            },


            /*
            ======================================
            DESCONECTADO
            ======================================
            */

            onDisconnected:
              () => {
                if (
                  cancelled
                ) {
                  return
                }


                setConnected(
                  false
                )

                setHasVideo(
                  false
                )

                setHasAudio(
                  false
                )

                setAudioBlocked(
                  false
                )

                setViewerCount(
                  0
                )
              },
          })


        /*
        Si el componente fue destruido
        mientras conectaba
        */

        if (cancelled) {
          await room.disconnect()

          return
        }


        activeRoom =
          room


        roomRef.current =
          room


        /*
        ========================================
        EVENTOS DE AUDIENCIA
        ========================================
        */

        room.on(
          RoomEvent.ParticipantConnected,
          updateViewerCount
        )


        room.on(
          RoomEvent.ParticipantDisconnected,
          updateViewerCount
        )


        setConnected(
          true
        )


        /*
        Conteo inicial
        */

        updateViewerCount()


        /*
        Safari / autoplay
        */

        if (
          room.canPlaybackAudio ===
          false
        ) {
          setAudioBlocked(
            true
          )
        }

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


    /*
    ==========================================
    LIMPIEZA
    ==========================================
    */

    return () => {
      cancelled =
        true


      if (activeRoom) {
        activeRoom.off(
          RoomEvent.ParticipantConnected,
          updateViewerCount
        )


        activeRoom.off(
          RoomEvent.ParticipantDisconnected,
          updateViewerCount
        )
      }


      if (
        videoRef.current
      ) {
        videoRef.current.pause()

        videoRef.current.srcObject =
          null
      }


      if (
        audioRef.current
      ) {
        audioRef.current.pause()

        audioRef.current.srcObject =
          null
      }


      if (
        roomRef.current
      ) {
        roomRef.current
          .disconnect()
          .catch(
            console.error
          )


        roomRef.current =
          null
      }


      setConnected(
        false
      )

      setHasVideo(
        false
      )

      setHasAudio(
        false
      )

      setAudioBlocked(
        false
      )

      setViewerCount(
        0
      )
    }

  }, [
    isLive,
  ])


  /*
  ==========================================
  OFFLINE
  ==========================================
  */

  if (!isLive) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-black">

        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-900 to-black">

          <div className="px-6 text-center">

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
  LIVE PLAYER
  ==========================================
  */

  return (
    <section
      ref={playerRef}
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border border-white/10
        bg-black
        shadow-2xl
      "
    >

      <div className="relative aspect-video bg-black">


        {/* ===================================
            VIDEO
        =================================== */}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="
            h-full
            w-full
            bg-black
            object-contain
          "
        />


        {/* ===================================
            AUDIO
        =================================== */}

        <audio
          ref={audioRef}
          autoPlay
          playsInline
        />


        {/* ===================================
            GRADIENTE SUPERIOR
        =================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-10
            h-28
            bg-gradient-to-b
            from-black/70
            to-transparent
          "
        />


        {/* ===================================
            GRADIENTE INFERIOR
        =================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-10
            h-32
            bg-gradient-to-t
            from-black/90
            via-black/40
            to-transparent
          "
        />


        {/* ===================================
            HEADER LIVE
        =================================== */}

        <div
          className="
            absolute
            left-3
            right-3
            top-3
            z-20
            flex
            items-start
            justify-between
            gap-3
            sm:left-4
            sm:right-4
            sm:top-4
          "
        >

          <div className="flex flex-wrap items-center gap-2">

            {/* LIVE */}

            <span
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-red-600
                px-3
                py-1.5
                text-[10px]
                font-black
                uppercase
                tracking-[0.15em]
                text-white
                sm:text-xs
              "
            >

              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />

              Live

            </span>


            {/* ESPECTADORES */}

            <span
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-black/60
                px-3
                py-1.5
                text-[10px]
                font-bold
                text-white
                backdrop-blur-md
                sm:text-xs
              "
            >

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
                  d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                />
              </svg>


              {viewerCount}

            </span>


            {/* CONEXIÓN */}

            <span
              className={`hidden rounded-lg px-3 py-1.5 text-[10px] font-bold backdrop-blur-md sm:block sm:text-xs ${
                connected
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-black/60 text-slate-400"
              }`}
            >
              {connected
                ? "● Conectado"
                : "Conectando..."}
            </span>

          </div>


          {/* CALIDAD / AUDIO */}

          {hasAudio &&
            !audioBlocked && (

            <span
              className="
                rounded-lg
                bg-black/60
                px-3
                py-1.5
                text-[10px]
                font-bold
                text-cyan-300
                backdrop-blur-md
                sm:text-xs
              "
            >
              {audioMuted
                ? "🔇"
                : "🔊 Audio"}
            </span>

          )}

        </div>


        {/* ===================================
            CARGANDO
        =================================== */}

        {!hasVideo &&
          !error && (

          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">

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


        {/* ===================================
            ERROR
        =================================== */}

        {error && (

          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">

            <div className="max-w-md px-6 text-center">

              <div className="text-4xl">
                ⚠️
              </div>


              <p className="mt-4 font-black text-red-400">
                Problema con la transmisión
              </p>


              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

            </div>

          </div>

        )}


        {/* ===================================
            ACTIVAR AUDIO
        =================================== */}

        {audioBlocked && (

          <div
            className="
              absolute
              left-1/2
              top-1/2
              z-40
              -translate-x-1/2
              -translate-y-1/2
            "
          >

            <button
              onClick={
                handleEnableAudio
              }
              disabled={
                activatingAudio
              }
              className="
                flex
                min-w-max
                items-center
                gap-3
                rounded-full
                border
                border-white/20
                bg-white
                px-5
                py-3
                text-sm
                font-black
                text-black
                shadow-2xl
                transition
                hover:scale-[1.03]
                disabled:opacity-50
              "
            >

              <span className="text-lg">
                🔊
              </span>


              {activatingAudio
                ? "Activando..."
                : "Activar audio"}

            </button>

          </div>

        )}


        {/* ===================================
            BARRA DE CONTROLES
        =================================== */}

        {hasVideo && (

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              z-30
              flex
              items-center
              justify-between
              gap-3
              px-3
              pb-3
              sm:px-5
              sm:pb-4
            "
          >

            {/* IZQUIERDA */}

            <div className="flex items-center gap-2">


              {/* AUDIO */}

              <PlayerButton
                onClick={
                  toggleAudio
                }
                title={
                  audioMuted
                    ? "Activar sonido"
                    : "Silenciar"
                }
              >

                {audioMuted ||
                audioBlocked ? (

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5 6.5 9H3v6h3.5L11 19V5Z"
                    />

                    <path
                      strokeLinecap="round"
                      d="m16 9 5 5m0-5-5 5"
                    />
                  </svg>

                ) : (

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5 6.5 9H3v6h3.5L11 19V5Z"
                    />

                    <path
                      strokeLinecap="round"
                      d="M15 9.5a4 4 0 0 1 0 5M17.8 7a7 7 0 0 1 0 10"
                    />
                  </svg>

                )}

              </PlayerButton>


              {/* LIVE TEXT */}

              <div className="hidden items-center gap-2 sm:flex">

                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

                <span className="text-xs font-black uppercase tracking-wider text-white">
                  En vivo
                </span>

              </div>

            </div>


            {/* DERECHA */}

            <div className="flex items-center gap-2">


              {/* PICTURE IN PICTURE */}

              <PlayerButton
                onClick={
                  togglePictureInPicture
                }
                title="Ventana flotante"
              >

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <rect
                    x="12"
                    y="11"
                    width="7"
                    height="5"
                    rx="1"
                  />
                </svg>

              </PlayerButton>


              {/* FULLSCREEN */}

              <PlayerButton
                onClick={
                  toggleFullscreen
                }
                title={
                  isFullscreen
                    ? "Salir de pantalla completa"
                    : "Pantalla completa"
                }
              >

                {isFullscreen ? (

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
                    />
                  </svg>

                ) : (

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"
                    />
                  </svg>

                )}

              </PlayerButton>

            </div>

          </div>

        )}


        {/* SIN AUDIO */}

        {connected &&
          !hasAudio &&
          !audioBlocked &&
          hasVideo && (

          <div className="absolute bottom-16 right-4 z-30 rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-slate-400 backdrop-blur">
            🔇 Esperando audio
          </div>

        )}

      </div>

    </section>
  )
}


/*
==========================================
BOTÓN DEL PLAYER
==========================================
*/

function PlayerButton({
  onClick,
  children,
  title,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-white/10
        bg-black/50
        text-white
        backdrop-blur-md
        transition
        hover:bg-white/15
        active:scale-95
        sm:h-11
        sm:w-11
      "
    >
      {children}
    </button>
  )
}


export default LiveVideo