import {
  Room,
  RoomEvent,
  Track,
} from "livekit-client"


export async function connectViewer({
  identity,
  onVideoTrack,
  onAudioTrack,
  onDisconnected,
}) {
  const response = await fetch(
    `/api/token?identity=${encodeURIComponent(
      identity
    )}&role=viewer`
  )

  if (!response.ok) {
    const errorText = await response.text()

    console.error(
      "Error obteniendo token viewer:",
      response.status,
      errorText
    )

    throw new Error(
      "No se pudo obtener el token de espectador."
    )
  }

  const data = await response.json()

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