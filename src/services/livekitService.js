import {
  Room,
  RoomEvent,
  Track,
} from "livekit-client"

let adminRoom = null

const TOKEN_SERVER = "http://localhost:3001"

async function getAdminToken(identity) {
  const response = await fetch(
    `${TOKEN_SERVER}/token?identity=${encodeURIComponent(
      identity
    )}&role=admin`
  )

  if (!response.ok) {
    throw new Error(
      `Error obteniendo token: ${response.status}`
    )
  }

  return response.json()
}

export async function connectAdminToLiveKit({
  identity,
  onDisconnected,
}) {
  if (adminRoom) {
    return adminRoom
  }

  const data = await getAdminToken(identity)

  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  })

  room.on(RoomEvent.Disconnected, () => {
    adminRoom = null

    if (onDisconnected) {
      onDisconnected()
    }
  })

  await room.connect(
    data.url,
    data.token
  )

  adminRoom = room

  return room
}

export async function startAdminCameraAndMic() {
  if (!adminRoom) {
    throw new Error(
      "El administrador no está conectado a LiveKit."
    )
  }

  await adminRoom.localParticipant.enableCameraAndMicrophone()

  return adminRoom
}

export function getAdminRoom() {
  return adminRoom
}

export function getLocalCameraTrack() {
  if (!adminRoom) return null

  const publication =
    adminRoom.localParticipant.getTrackPublication(
      Track.Source.Camera
    )

  return publication?.track || null
}

export async function setCameraEnabled(enabled) {
  if (!adminRoom) {
    throw new Error("No hay conexión con LiveKit.")
  }

  await adminRoom.localParticipant.setCameraEnabled(
    enabled
  )
}

export async function setMicrophoneEnabled(enabled) {
  if (!adminRoom) {
    throw new Error("No hay conexión con LiveKit.")
  }

  await adminRoom.localParticipant.setMicrophoneEnabled(
    enabled
  )
}

export function isCameraEnabled() {
  return (
    adminRoom?.localParticipant
      ?.isCameraEnabled ?? false
  )
}

export function isMicrophoneEnabled() {
  return (
    adminRoom?.localParticipant
      ?.isMicrophoneEnabled ?? false
  )
}

export async function disconnectAdminFromLiveKit() {
  if (!adminRoom) return

  await adminRoom.disconnect()
  adminRoom = null
}