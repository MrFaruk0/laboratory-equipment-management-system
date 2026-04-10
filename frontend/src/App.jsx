import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import MakeReservationPage from "./pages/MakeReservationPage";
import ProfilePage from "./pages/ProfilePage";

// Login olmayan kullanıcıları /login'e yönlendirir
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // Yükleniyor, henüz karar verme
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/reservations"
            element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>}
          />
          <Route
            path="/make-reservation"
            element={<ProtectedRoute><MakeReservationPage /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;