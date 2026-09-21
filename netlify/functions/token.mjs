import { AccessToken } from "livekit-server-sdk"

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

    const canPublish = role === "publisher"

    const token = new AccessToken(
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

    const jwt = await token.toJwt()

    return Response.json({
      token: jwt,
      url: process.env.LIVEKIT_URL,
    })
  } catch (error) {
    console.error("Error creando token LiveKit:", error)

    return Response.json(
      {
        error: "No se pudo generar el token",
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