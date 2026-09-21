import {
  Room,
  RoomEvent,
  Track,
} from "livekit-client"


let adminRoom = null


/*
==========================================================
OBTENER TOKEN ADMIN DESDE NETLIFY
==========================================================
*/

async function getAdminToken(identity) {
  const response = await fetch(
    `/api/token?identity=${encodeURIComponent(
      identity
    )}&role=admin`
  )

  if (!response.ok) {
    const errorText =
      await response.text()

    console.error(
      "Error obteniendo token admin:",
      response.status,
      errorText
    )

    throw new Error(
      `Error obteniendo token: ${response.status}`
    )
  }


  const data =
    await response.json()


  if (!data.token) {
    throw new Error(
      "El servidor no devolvió un token LiveKit."
    )
  }


  if (!data.url) {
    throw new Error(
      "El servidor no devolvió la URL de LiveKit."
    )
  }


  return data
}


/*
==========================================================
CONECTAR ADMIN
==========================================================
*/

export async function connectAdminToLiveKit({
  identity,
  onDisconnected,
}) {
  if (adminRoom) {
    return adminRoom
  }


  const data =
    await getAdminToken(identity)


  const room =
    new Room({
      adaptiveStream: true,
      dynacast: true,
    })


  room.on(
    RoomEvent.Disconnected,
    () => {
      adminRoom = null

      if (onDisconnected) {
        onDisconnected()
      }
    }
  )


  await room.connect(
    data.url,
    data.token
  )


  adminRoom = room


  return room
}


/*
==========================================================
INICIAR CÁMARA + MICRÓFONO

En celular intenta iniciar con cámara trasera.
==========================================================
*/

export async function startAdminCameraAndMic() {
  if (!adminRoom) {
    throw new Error(
      "El administrador no está conectado a LiveKit."
    )
  }


  /*
  Intentar cámara trasera primero
  */

  try {
    await adminRoom.localParticipant
      .setCameraEnabled(
        true,
        {
          facingMode: "environment",
        }
      )
  } catch (error) {
    console.warn(
      "No fue posible iniciar con cámara trasera. Intentando cámara normal.",
      error
    )

    await adminRoom.localParticipant
      .setCameraEnabled(true)
  }


  /*
  Micrófono
  */

  await adminRoom.localParticipant
    .setMicrophoneEnabled(true)


  return adminRoom
}


/*
==========================================================
OBTENER ROOM
==========================================================
*/

export function getAdminRoom() {
  return adminRoom
}


/*
==========================================================
OBTENER TRACK LOCAL DE CÁMARA
==========================================================
*/

export function getLocalCameraTrack() {
  if (!adminRoom) {
    return null
  }


  const publication =
    adminRoom.localParticipant
      .getTrackPublication(
        Track.Source.Camera
      )


  return publication?.track || null
}


/*
==========================================================
CÁMARA ON / OFF
==========================================================
*/

export async function setCameraEnabled(
  enabled
) {
  if (!adminRoom) {
    throw new Error(
      "No hay conexión con LiveKit."
    )
  }


  await adminRoom.localParticipant
    .setCameraEnabled(enabled)
}


/*
==========================================================
MIC ON / OFF
==========================================================
*/

export async function setMicrophoneEnabled(
  enabled
) {
  if (!adminRoom) {
    throw new Error(
      "No hay conexión con LiveKit."
    )
  }


  await adminRoom.localParticipant
    .setMicrophoneEnabled(enabled)
}


/*
==========================================================
ESTADO CÁMARA
==========================================================
*/

export function isCameraEnabled() {
  return (
    adminRoom
      ?.localParticipant
      ?.isCameraEnabled ??
    false
  )
}


/*
==========================================================
ESTADO MIC
==========================================================
*/

export function isMicrophoneEnabled() {
  return (
    adminRoom
      ?.localParticipant
      ?.isMicrophoneEnabled ??
    false
  )
}


/*
==========================================================
CONTADOR DE ESPECTADORES
==========================================================
*/

export function getViewerCount() {
  if (!adminRoom) {
    return 0
  }


  return adminRoom
    .remoteParticipants
    .size
}


/*
==========================================================
CAMBIAR CÁMARA FRONTAL / TRASERA
==========================================================
*/

export async function switchCamera(
  facingMode = "environment"
) {
  if (!adminRoom) {
    throw new Error(
      "No hay conexión activa con LiveKit."
    )
  }


  const publication =
    adminRoom.localParticipant
      .getTrackPublication(
        Track.Source.Camera
      )


  const videoTrack =
    publication?.track


  if (!videoTrack) {
    throw new Error(
      "No hay una cámara activa."
    )
  }


  /*
  Reinicia solamente el track de cámara.
  No desconecta la transmisión.
  */

  await videoTrack.restartTrack({
    facingMode,
  })


  return videoTrack
}


/*
==========================================================
DESCONECTAR
==========================================================
*/

export async function disconnectAdminFromLiveKit() {
  if (!adminRoom) {
    return
  }


  await adminRoom.disconnect()


  adminRoom = null
}