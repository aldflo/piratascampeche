import {
  Room,
  RoomEvent,
  Track,
} from "livekit-client"

const TOKEN_SERVER =
  "http://localhost:3001"

export async function connectViewer({
  identity,
  onVideoTrack,
  onAudioTrack,
  onDisconnected,
}) {
  const response = await fetch(
    `${TOKEN_SERVER}/token?identity=${encodeURIComponent(
      identity
    )}&role=viewer`
  )

  if (!response.ok) {
    throw new Error(
      "No se pudo obtener el token de espectador."
    )
  }

  const data = await response.json()

  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  })

  room.on(
    RoomEvent.TrackSubscribed,
    (
      track,
      publication,
      participant
    ) => {
      console.log(
        "Track recibido:",
        track.kind,
        participant.identity
      )

      if (
        track.kind ===
        Track.Kind.Video
      ) {
        onVideoTrack?.(track)
      }

      if (
        track.kind ===
        Track.Kind.Audio
      ) {
        onAudioTrack?.(track)
      }
    }
  )

  room.on(
    RoomEvent.TrackUnsubscribed,
    (track) => {
      track.detach()
    }
  )

  room.on(
    RoomEvent.Disconnected,
    () => {
      onDisconnected?.()
    }
  )

  await room.connect(
    data.url,
    data.token
  )

  return room
}