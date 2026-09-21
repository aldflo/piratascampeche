import express from "express"
import cors from "cors"
import { AccessToken } from "livekit-server-sdk"

const app = express()

app.use(cors())
app.use(express.json())

const LIVEKIT_API_KEY = "devkey"
const LIVEKIT_API_SECRET = "secret"

app.get("/token", async (req, res) => {
  try {
    const identity =
      req.query.identity || `viewer-${Date.now()}`

    const role =
      req.query.role || "viewer"

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity,
      }
    )

    token.addGrant({
      roomJoin: true,
      room: "piratas-live",
      canPublish: role === "admin",
      canSubscribe: true,
    })

    const jwt = await token.toJwt()

    res.json({
      token: jwt,
      url: "ws://127.0.0.1:7880",
      room: "piratas-live",
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "No se pudo generar el token",
    })
  }
})

app.listen(3001, () => {
  console.log("Servidor de tokens activo")
  console.log("http://localhost:3001")
})