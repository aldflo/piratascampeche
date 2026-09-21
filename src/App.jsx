import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Live from "./pages/Live"
import Login from "./pages/Login"
import Admin from "./pages/Admin"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#05070b] text-white">
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/live"
            element={<Live />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/control"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App