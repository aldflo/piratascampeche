import {
  AccessToken,
} from "livekit-server-sdk"


export default async (req) => {
  try {
    const url = new URL(req.url)


    const identity =
      url.searchParams.get("identity") ||
      `viewer-${Date.now()}`


    const room =
      url.searchParams.get("room") ||
      "piratas-live"


    const role =
      url.searchParams.get("role") ||
      "viewer"


    /*
      ADMIN / PUBLISHER:
      puede publicar cámara y micrófono.

      VIEWER:
      solamente puede recibir la transmisión.
    */

    const canPublish =
      role === "admin" ||
      role === "publisher"


    /*
      Verificamos que Netlify tenga
      las variables necesarias.
    */

    if (
      !process.env.LIVEKIT_API_KEY ||
      !process.env.LIVEKIT_API_SECRET ||
      !process.env.LIVEKIT_URL
    ) {
      console.error(
        "Faltan variables de entorno de LiveKit."
      )

      return Response.json(
        {
          error:
            "Configuración LiveKit incompleta.",
        },
        {
          status: 500,
        }
      )
    }


    const token =
      new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
          identity,
          ttl: "6h",
        }
      )


    token.addGrant({
      roomJoin: true,
      room,

      canPublish,

      canSubscribe: true,
    })


    const jwt =
      await token.toJwt()


    return Response.json({
      token: jwt,

      url:
        process.env.LIVEKIT_URL,

      room,

      role,
    })
  } catch (error) {
    console.error(
      "Error creando token LiveKit:",
      error
    )


    return Response.json(
      {
        error:
          "No se pudo generar el token.",
      },
      {
        status: 500,
      }
    )
  }
}


export const config = {
  path: "/api/token",
}