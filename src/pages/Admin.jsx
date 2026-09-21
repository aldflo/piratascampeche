import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  signOut,
} from "firebase/auth"

import {
  useNavigate,
} from "react-router-dom"

import {
  RoomEvent,
} from "livekit-client"

import {
  auth,
} from "../firebase.config"

import {
  subscribeToCurrentStream,
  startCurrentStream,
  stopCurrentStream,
  updateCurrentStream,
} from "../services/streamService"

import {
  connectAdminToLiveKit,
  startAdminCameraAndMic,
  getLocalCameraTrack,
  setCameraEnabled as setLiveKitCameraEnabled,
  setMicrophoneEnabled as setLiveKitMicrophoneEnabled,
  disconnectAdminFromLiveKit,
  switchCamera,
} from "../services/livekitService"


function Admin() {
  const navigate =
    useNavigate()


  const videoRef =
    useRef(null)


  const [
    streamInfo,
    setStreamInfo,
  ] = useState(null)


  const [
    streamTitle,
    setStreamTitle,
  ] = useState(
    "Piratas Live"
  )


  const [
    streamDescription,
    setStreamDescription,
  ] = useState(
    "Transmisión oficial del partido"
  )


  const [
    livekitRoom,
    setLivekitRoom,
  ] = useState(null)


  const [
    cameraAllowed,
    setCameraAllowed,
  ] = useState(false)


  const [
    micAllowed,
    setMicAllowed,
  ] = useState(false)


  const [
    cameraEnabled,
    setCameraEnabled,
  ] = useState(false)


  const [
    micEnabled,
    setMicEnabled,
  ] = useState(false)


  const [
    livekitConnected,
    setLivekitConnected,
  ] = useState(false)


  const [
    previewActive,
    setPreviewActive,
  ] = useState(false)


  const [
    loadingAction,
    setLoadingAction,
  ] = useState(false)


  const [
    switchingCamera,
    setSwitchingCamera,
  ] = useState(false)


  const [
    message,
    setMessage,
  ] = useState("")


  const [
    error,
    setError,
  ] = useState("")


  /*
  ==========================================
  NUEVO:
  CONTADOR DE ESPECTADORES
  ==========================================
  */

  const [
    viewerCount,
    setViewerCount,
  ] = useState(0)


  /*
  ==========================================
  NUEVO:
  FRONTAL / TRASERA
  ==========================================
  */

  const [
    cameraFacing,
    setCameraFacing,
  ] = useState(
    "environment"
  )


  /*
  ==========================================
  FIRESTORE
  ==========================================
  */

  useEffect(() => {
    const unsubscribe =
      subscribeToCurrentStream(
        (data) => {
          setStreamInfo(data)


          if (!data) {
            return
          }


          if (data.title) {
            setStreamTitle(
              data.title
            )
          }


          if (
            data.description
          ) {
            setStreamDescription(
              data.description
            )
          }
        }
      )


    return () =>
      unsubscribe()
  }, [])


  /*
  ==========================================
  CONTADOR DE ESPECTADORES LIVEKIT
  ==========================================
  */

  useEffect(() => {
    if (!livekitRoom) {
      setViewerCount(0)

      return
    }


    const updateViewerCount =
      () => {
        setViewerCount(
          livekitRoom
            .remoteParticipants
            .size
        )
      }


    /*
    Contar los que ya están conectados.
    */

    updateViewerCount()


    /*
    Escuchar nuevas conexiones.
    */

    livekitRoom.on(
      RoomEvent.ParticipantConnected,
      updateViewerCount
    )


    /*
    Escuchar desconexiones.
    */

    livekitRoom.on(
      RoomEvent.ParticipantDisconnected,
      updateViewerCount
    )


    return () => {
      livekitRoom.off(
        RoomEvent.ParticipantConnected,
        updateViewerCount
      )


      livekitRoom.off(
        RoomEvent.ParticipantDisconnected,
        updateViewerCount
      )
    }
  }, [
    livekitRoom,
  ])


  /*
  ==========================================
  PREVIEW LIVEKIT
  ==========================================
  */

  useEffect(() => {
    if (
      !livekitRoom ||
      !previewActive ||
      !videoRef.current
    ) {
      return
    }


    const cameraTrack =
      getLocalCameraTrack()


    if (!cameraTrack) {
      return
    }


    const video =
      videoRef.current


    try {
      cameraTrack.attach(
        video
      )


      video
        .play()
        .catch(
          (err) => {
            console.error(
              "Error reproduciendo preview:",
              err
            )
          }
        )
    } catch (err) {
      console.error(
        "Error conectando preview:",
        err
      )
    }


    return () => {
      try {
        cameraTrack.detach(
          video
        )
      } catch (err) {
        console.error(
          "Error separando preview:",
          err
        )
      }
    }
  }, [
    livekitRoom,
    previewActive,
    cameraEnabled,
    cameraFacing,
  ])


  /*
  ==========================================
  LIMPIEZA AL SALIR
  ==========================================
  */

  useEffect(() => {
    return () => {
      disconnectAdminFromLiveKit()
        .catch(
          (err) => {
            console.error(
              err
            )
          }
        )
    }
  }, [])


  /*
  ==========================================
  INICIAR TRANSMISIÓN
  ==========================================
  */

  const handleStartBroadcast =
    async () => {
      setLoadingAction(true)

      setError("")
      setMessage("")


      try {
        /*
        ========================================
        IDENTIDAD ADMIN
        ========================================
        */

        const identity =
          auth.currentUser
            ?.uid ||
          `admin-${Date.now()}`


        /*
        ========================================
        LIVEKIT
        ========================================
        */

        const room =
          await connectAdminToLiveKit({
            identity,

            onDisconnected:
              () => {
                setLivekitConnected(
                  false
                )

                setCameraEnabled(
                  false
                )

                setMicEnabled(
                  false
                )

                setPreviewActive(
                  false
                )

                setLivekitRoom(
                  null
                )

                setViewerCount(
                  0
                )
              },
          })


        setLivekitRoom(
          room
        )

        setLivekitConnected(
          true
        )


        /*
        ========================================
        CÁMARA TRASERA + MIC
        ========================================
        */

        await startAdminCameraAndMic()


        setCameraFacing(
          "environment"
        )


        setCameraAllowed(
          true
        )

        setMicAllowed(
          true
        )


        setCameraEnabled(
          true
        )

        setMicEnabled(
          true
        )


        setPreviewActive(
          true
        )


        /*
        ========================================
        FIRESTORE
        ========================================
        */

        await startCurrentStream({
          title:
            streamTitle ||
            "Piratas Live",

          description:
            streamDescription ||
            "Transmisión oficial del partido",

          cameraAllowed:
            true,

          micAllowed:
            true,

          cameraEnabled:
            true,

          micEnabled:
            true,

          adminEmail:
            auth.currentUser
              ?.email ||
            "",
        })


        setMessage(
          "Transmisión conectada. Cámara y micrófono están enviando señal."
        )
      } catch (err) {
        console.error(
          "Error iniciando transmisión:",
          err
        )


        if (
          err?.name ===
            "NotAllowedError" ||
          err?.name ===
            "PermissionDeniedError"
        ) {
          setError(
            "Debes permitir el acceso a la cámara y al micrófono."
          )
        } else if (
          err?.name ===
          "NotFoundError"
        ) {
          setError(
            "No encontramos una cámara o micrófono disponible."
          )
        } else {
          setError(
            err?.message ||
            "No se pudo iniciar la transmisión."
          )
        }


        setCameraEnabled(
          false
        )

        setMicEnabled(
          false
        )

        setPreviewActive(
          false
        )


        try {
          await disconnectAdminFromLiveKit()
        } catch {
          // nada
        }


        setLivekitConnected(
          false
        )

        setLivekitRoom(
          null
        )

        setViewerCount(
          0
        )
      } finally {
        setLoadingAction(
          false
        )
      }
    }


  /*
  ==========================================
  FINALIZAR TRANSMISIÓN
  ==========================================
  */

  const handleStopBroadcast =
    async () => {
      setLoadingAction(true)

      setError("")
      setMessage("")


      try {
        await stopCurrentStream()


        await disconnectAdminFromLiveKit()


        if (
          videoRef.current
        ) {
          videoRef.current
            .srcObject =
            null
        }


        setLivekitRoom(
          null
        )

        setLivekitConnected(
          false
        )

        setPreviewActive(
          false
        )


        setCameraEnabled(
          false
        )

        setMicEnabled(
          false
        )


        setCameraAllowed(
          false
        )

        setMicAllowed(
          false
        )


        setViewerCount(
          0
        )


        setCameraFacing(
          "environment"
        )


        setMessage(
          "Transmisión finalizada correctamente."
        )
      } catch (err) {
        console.error(
          "Error finalizando transmisión:",
          err
        )


        setError(
          "No se pudo finalizar la transmisión."
        )
      } finally {
        setLoadingAction(
          false
        )
      }
    }


  /*
  ==========================================
  CÁMARA ON / OFF
  ==========================================
  */

  const toggleCamera =
    async () => {
      if (
        !livekitConnected
      ) {
        return
      }


      setError("")


      const nextState =
        !cameraEnabled


      try {
        await setLiveKitCameraEnabled(
          nextState
        )


        setCameraEnabled(
          nextState
        )


        if (nextState) {
          setPreviewActive(
            false
          )


          setTimeout(
            () => {
              setPreviewActive(
                true
              )
            },
            100
          )
        }


        await updateCurrentStream({
          cameraEnabled:
            nextState,
        })
      } catch (err) {
        console.error(
          err
        )


        setError(
          "No se pudo cambiar el estado de la cámara."
        )
      }
    }


  /*
  ==========================================
  CAMBIAR FRONTAL / TRASERA
  ==========================================
  */

  const handleSwitchCamera =
    async () => {
      if (
        !livekitConnected ||
        !cameraEnabled ||
        switchingCamera
      ) {
        return
      }


      setSwitchingCamera(
        true
      )

      setError("")
      setMessage("")


      try {
        const nextFacing =
          cameraFacing ===
          "environment"
            ? "user"
            : "environment"


        /*
        Pausar preview mientras
        LiveKit reinicia la pista.
        */

        setPreviewActive(
          false
        )


        await switchCamera(
          nextFacing
        )


        setCameraFacing(
          nextFacing
        )


        setTimeout(
          () => {
            setPreviewActive(
              true
            )
          },
          150
        )
      } catch (err) {
        console.error(
          "Error cambiando cámara:",
          err
        )


        setPreviewActive(
          true
        )


        setError(
          "No se pudo cambiar entre la cámara frontal y trasera."
        )
      } finally {
        setSwitchingCamera(
          false
        )
      }
    }


  /*
  ==========================================
  MIC ON / OFF
  ==========================================
  */

  const toggleMic =
    async () => {
      if (
        !livekitConnected
      ) {
        return
      }


      setError("")


      const nextState =
        !micEnabled


      try {
        await setLiveKitMicrophoneEnabled(
          nextState
        )


        setMicEnabled(
          nextState
        )


        await updateCurrentStream({
          micEnabled:
            nextState,
        })
      } catch (err) {
        console.error(
          err
        )


        setError(
          "No se pudo cambiar el estado del micrófono."
        )
      }
    }


  /*
  ==========================================
  CERRAR SESIÓN
  ==========================================
  */

  const handleLogout =
    async () => {
      try {
        if (
          livekitConnected
        ) {
          await disconnectAdminFromLiveKit()

          await stopCurrentStream()
        }


        await signOut(
          auth
        )


        navigate("/")
      } catch (err) {
        console.error(
          err
        )


        setError(
          "No se pudo cerrar la sesión."
        )
      }
    }


  /*
  ==========================================
  ESTADOS
  ==========================================
  */

  const isLive =
    streamInfo?.isLive ??
    false


  const transmissionActive =
    livekitConnected &&
    isLive


  return (
    <main className="min-h-screen bg-[#05070b] px-5 py-10 text-white">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
              Administración
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Mesa de transmisión
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Controla la señal, cámaras,
              micrófono y espectadores
              de Piratas Live.
            </p>

          </div>


          <div className="flex flex-wrap items-center gap-3">

            {/* ESPECTADORES */}

            <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2">

              <span>
                👥
              </span>

              <span className="text-xs font-black text-blue-300">
                {viewerCount}
              </span>

              <span className="text-xs text-blue-400">
                espectadores
              </span>

            </div>


            <div
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
                transmissionActive
                  ? "border-red-500/20 bg-red-500/15 text-red-400"
                  : "border-white/10 bg-white/5 text-slate-400"
              }`}
            >
              {transmissionActive
                ? "● EN VIVO"
                : "OFFLINE"}
            </div>


            <button
              onClick={
                handleLogout
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              Cerrar sesión
            </button>

          </div>

        </div>


        {/* MENSAJES */}

        {(message || error) && (

          <div className="mb-6 space-y-3">

            {message && (

              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-400">
                {message}
              </div>

            )}


            {error && (

              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
                {error}
              </div>

            )}

          </div>

        )}


        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">

          {/* PRINCIPAL */}

          <div className="space-y-6">


            <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035]">

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                    Transmisión
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Señal en vivo
                  </h2>

                </div>


                <span
                  className={`rounded-full px-4 py-2 text-xs font-black ${
                    transmissionActive
                      ? "bg-red-600 text-white"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {transmissionActive
                    ? "ON AIR"
                    : "OFFLINE"}
                </span>

              </div>


              <div className="p-6">

                {/* VIDEO */}

                <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black">

                  <div className="aspect-video">

                    {previewActive ? (

                      <video
                        ref={
                          videoRef
                        }
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-black">

                        <div className="text-center">

                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl">
                            📹
                          </div>

                          <p className="mt-5 font-semibold text-slate-300">
                            Preview LiveKit
                          </p>

                          <p className="mt-2 text-sm text-slate-600">
                            Presiona iniciar transmisión para conectar cámara y micrófono.
                          </p>

                        </div>

                      </div>

                    )}

                  </div>


                  {/* INDICADORES */}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">

                    <span
                      className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                        transmissionActive
                          ? "bg-red-600 text-white"
                          : "bg-black/50 text-slate-300"
                      }`}
                    >
                      {transmissionActive
                        ? "LIVE"
                        : "OFFLINE"}
                    </span>


                    <span
                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                        cameraEnabled
                          ? "bg-green-500/20 text-green-400"
                          : "bg-black/50 text-slate-400"
                      }`}
                    >
                      Cámara{" "}
                      {cameraEnabled
                        ? "ON"
                        : "OFF"}
                    </span>


                    <span
                      className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                        micEnabled
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-black/50 text-slate-400"
                      }`}
                    >
                      Mic{" "}
                      {micEnabled
                        ? "ON"
                        : "OFF"}
                    </span>


                    {cameraEnabled && (

                      <span className="rounded-full bg-violet-500/20 px-3 py-1.5 text-[11px] font-bold text-violet-300">
                        {cameraFacing ===
                        "environment"
                          ? "📷 Trasera"
                          : "🤳 Frontal"}
                      </span>

                    )}

                  </div>


                  {/* ESPECTADORES SOBRE VIDEO */}

                  {transmissionActive && (

                    <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur">

                      <span className="text-xs">
                        👁
                      </span>

                      <span className="text-xs font-black text-white">
                        {viewerCount}
                      </span>

                    </div>

                  )}

                </div>


                {/* CONTROLES */}

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                  {/* CÁMARA */}

                  <button
                    onClick={
                      toggleCamera
                    }
                    disabled={
                      !livekitConnected ||
                      loadingAction
                    }
                    className={`group rounded-[22px] border px-5 py-4 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 ${
                      cameraEnabled
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-6 w-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2.5l5 3v-9l-5 3Z"
                          />
                        </svg>

                      </div>


                      <div className="flex-1">

                        <p className="text-sm font-black">
                          Cámara
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            cameraEnabled
                              ? "text-emerald-400"
                              : "text-slate-500"
                          }`}
                        >
                          {cameraEnabled
                            ? "Encendida"
                            : "Apagada"}
                        </p>

                      </div>


                      <Switch
                        active={
                          cameraEnabled
                        }
                      />

                    </div>

                  </button>


                  {/* CAMBIAR CÁMARA */}

                  <button
                    onClick={
                      handleSwitchCamera
                    }
                    disabled={
                      !livekitConnected ||
                      !cameraEnabled ||
                      loadingAction ||
                      switchingCamera
                    }
                    className="rounded-[22px] border border-violet-500/30 bg-violet-500/10 px-5 py-4 text-left transition-all duration-300 hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-30"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                        🔄
                      </div>


                      <div>

                        <p className="text-sm font-black">
                          {switchingCamera
                            ? "Cambiando..."
                            : "Cambiar cámara"}
                        </p>

                        <p className="mt-1 text-xs text-violet-300">
                          {cameraFacing ===
                          "environment"
                            ? "Trasera"
                            : "Frontal"}
                        </p>

                      </div>

                    </div>

                  </button>


                  {/* MIC */}

                  <button
                    onClick={
                      toggleMic
                    }
                    disabled={
                      !livekitConnected ||
                      loadingAction
                    }
                    className={`rounded-[22px] border px-5 py-4 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 ${
                      micEnabled
                        ? "border-cyan-500/30 bg-cyan-500/10"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-6 w-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Zm0 0v4m-4 0h8M5 11a7 7 0 0 0 14 0"
                          />
                        </svg>

                      </div>


                      <div className="flex-1">

                        <p className="text-sm font-black">
                          Micrófono
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            micEnabled
                              ? "text-cyan-400"
                              : "text-slate-500"
                          }`}
                        >
                          {micEnabled
                            ? "Encendido"
                            : "Apagado"}
                        </p>

                      </div>


                      <Switch
                        active={
                          micEnabled
                        }
                        cyan
                      />

                    </div>

                  </button>


                  {/* INICIAR */}

                  <button
                    onClick={
                      handleStartBroadcast
                    }
                    disabled={
                      loadingAction ||
                      transmissionActive
                    }
                    className={`group rounded-[22px] border px-5 py-4 transition-all duration-300 disabled:cursor-not-allowed ${
                      transmissionActive
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-blue-500/30 bg-blue-600 hover:bg-blue-500"
                    }`}
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          transmissionActive
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/15 text-white"
                        }`}
                      >

                        {transmissionActive ? (

                          <span className="h-3 w-3 animate-pulse rounded-full bg-red-400" />

                        ) : (

                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-6 w-6"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>

                        )}

                      </div>


                      <div className="text-left">

                        <p className="text-sm font-black">

                          {loadingAction
                            ? "Conectando..."
                            : transmissionActive
                            ? "Transmitiendo"
                            : "Iniciar transmisión"}

                        </p>

                        <p className="mt-1 text-xs text-blue-100">

                          {transmissionActive
                            ? "LiveKit conectado"
                            : "Publicar señal"}

                        </p>

                      </div>

                    </div>

                  </button>

                </div>


                {/* FINALIZAR */}

                <button
                  onClick={
                    handleStopBroadcast
                  }
                  disabled={
                    loadingAction ||
                    !transmissionActive
                  }
                  className="mt-4 flex w-full items-center justify-center gap-3 rounded-[22px] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-black text-red-400 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-25"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10">
                    <span className="h-3 w-3 rounded-[3px] bg-red-400" />
                  </span>

                  Finalizar transmisión

                </button>

              </div>

            </section>


            {/* DATOS */}

            <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Información del directo
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Datos de transmisión
              </h2>


              <div className="mt-6 space-y-4">

                <input
                  value={
                    streamTitle
                  }
                  onChange={
                    (e) =>
                      setStreamTitle(
                        e.target.value
                      )
                  }
                  placeholder="Título"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 outline-none focus:border-blue-500"
                />


                <textarea
                  value={
                    streamDescription
                  }
                  onChange={
                    (e) =>
                      setStreamDescription(
                        e.target.value
                      )
                  }
                  rows="4"
                  placeholder="Descripción"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-4 outline-none focus:border-blue-500"
                />

              </div>

            </section>

          </div>


          {/* SIDEBAR */}

          <aside className="space-y-6">

            {/* ESPECTADORES */}

            <section className="rounded-[30px] border border-blue-500/20 bg-gradient-to-br from-blue-600/15 to-cyan-500/5 p-6">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Audiencia
              </p>


              <div className="mt-4 flex items-end justify-between">

                <div>

                  <p className="text-5xl font-black tracking-tight">
                    {viewerCount}
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    espectadores conectados
                  </p>

                </div>


                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
                  👥
                </div>

              </div>

            </section>


            {/* ESTADO */}

            <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Estado
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Sistema
              </h3>


              <div className="mt-6 space-y-3">

                <StatusRow
                  name="LiveKit"
                  value={
                    livekitConnected
                      ? "Conectado"
                      : "Desconectado"
                  }
                  active={
                    livekitConnected
                  }
                />


                <StatusRow
                  name="Transmisión"
                  value={
                    transmissionActive
                      ? "En vivo"
                      : "Offline"
                  }
                  active={
                    transmissionActive
                  }
                />


                <StatusRow
                  name="Cámara"
                  value={
                    cameraEnabled
                      ? cameraFacing ===
                        "environment"
                        ? "Trasera"
                        : "Frontal"
                      : "Apagada"
                  }
                  active={
                    cameraEnabled
                  }
                />


                <StatusRow
                  name="Micrófono"
                  value={
                    micEnabled
                      ? "Encendido"
                      : "Apagado"
                  }
                  active={
                    micEnabled
                  }
                />


                <StatusRow
                  name="Permiso cámara"
                  value={
                    cameraAllowed
                      ? "Permitido"
                      : "Sin permiso"
                  }
                  active={
                    cameraAllowed
                  }
                />


                <StatusRow
                  name="Permiso micrófono"
                  value={
                    micAllowed
                      ? "Permitido"
                      : "Sin permiso"
                  }
                  active={
                    micAllowed
                  }
                />

              </div>


              <div className="mt-5 border-t border-white/10 pt-5">

                <p className="text-xs text-slate-600">
                  Operador
                </p>

                <p className="mt-1 break-all text-sm font-bold text-slate-300">
                  {auth.currentUser
                    ?.email ||
                    "No identificado"}
                </p>

              </div>

            </section>


            {/* LIVE */}

            <section className="rounded-[30px] border border-blue-500/20 bg-blue-600/10 p-6">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Live
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Estado público
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Firestore controla el estado público y LiveKit transporta el video y audio.
              </p>


              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">

                <p className="text-xs text-slate-600">
                  Título
                </p>

                <p className="mt-2 font-bold">
                  {streamInfo?.title ||
                    "Sin título"}
                </p>

              </div>


              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">

                <p className="text-xs text-slate-600">
                  Sala LiveKit
                </p>

                <p className="mt-2 font-bold text-blue-300">
                  piratas-live
                </p>

              </div>


              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">

                <p className="text-xs text-slate-600">
                  Espectadores
                </p>

                <p className="mt-2 text-2xl font-black text-white">
                  {viewerCount}
                </p>

              </div>

            </section>

          </aside>

        </div>

      </div>

    </main>
  )
}


/*
==========================================
SWITCH
==========================================
*/

function Switch({
  active,
  cyan = false,
}) {
  return (

    <div
      className={`relative h-6 w-11 rounded-full transition-all duration-300 ${
        active
          ? cyan
            ? "bg-cyan-500"
            : "bg-emerald-500"
          : "bg-slate-700"
      }`}
    >

      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
          active
            ? "left-6"
            : "left-1"
        }`}
      />

    </div>

  )
}


/*
==========================================
STATUS ROW
==========================================
*/

function StatusRow({
  name,
  value,
  active,
}) {
  return (

    <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-4">

      <span className="text-sm text-slate-400">
        {name}
      </span>

      <span
        className={`text-sm font-bold ${
          active
            ? "text-green-400"
            : "text-slate-500"
        }`}
      >
        {value}
      </span>

    </div>

  )
}


export default Admin