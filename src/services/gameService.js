import {
  doc,
  onSnapshot,
} from "firebase/firestore"

import {
  db,
} from "../firebase.config"

export function subscribeToCurrentGame(callback) {
  const gameRef = doc(
    db,
    "games",
    "current"
  )

  const unsubscribe = onSnapshot(
    gameRef,
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
        "Error escuchando el partido:",
        error
      )
    }
  )

  return unsubscribe
}