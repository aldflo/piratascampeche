import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "../firebase.config"

const streamRef = doc(
  db,
  "stream",
  "current"
)

/*
==========================================
ESCUCHAR TRANSMISIÓN
==========================================
*/

export function subscribeToCurrentStream(
  callback
) {
  return onSnapshot(
    streamRef,

    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        })
      } else {
        callback(null)
      }
    },

    (error) => {
      console.error(
        "Error escuchando stream:",
        error
      )

      callback(null)
    }
  )
}

/*
==========================================
INICIAR TRANSMISIÓN
==========================================
*/

export async function startCurrentStream(
  data = {}
) {
  await setDoc(
    streamRef,

    {
      isLive: true,

      status: "live",

      title:
        data.title ||
        "Piratas Live",

      description:
        data.description ||
        "Transmisión oficial del partido",

      cameraAllowed:
        data.cameraAllowed ?? false,

      micAllowed:
        data.micAllowed ?? false,

      cameraEnabled:
        data.cameraEnabled ?? false,

      micEnabled:
        data.micEnabled ?? false,

      adminEmail:
        data.adminEmail || "",

      startedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },

    {
      merge: true,
    }
  )
}

/*
==========================================
ACTUALIZAR TRANSMISIÓN
==========================================
*/

export async function updateCurrentStream(
  data = {}
) {
  await setDoc(
    streamRef,

    {
      ...data,

      updatedAt:
        serverTimestamp(),
    },

    {
      merge: true,
    }
  )
}

/*
==========================================
FINALIZAR TRANSMISIÓN
==========================================
*/

export async function stopCurrentStream() {
  await setDoc(
    streamRef,

    {
      isLive: false,

      status: "offline",

      cameraEnabled: false,

      micEnabled: false,

      updatedAt:
        serverTimestamp(),
    },

    {
      merge: true,
    }
  )
}