import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import MakeReservationPage from "./pages/MakeReservationPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminEquipmentPage from "./pages/AdminEquipmentPage";
import AdminReservationsPage from "./pages/AdminReservationsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/reservations" replace />;
  return children;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* User routes */}
          <Route path="/reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
          <Route path="/make-reservation" element={<ProtectedRoute><MakeReservationPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/equipment" element={<AdminRoute><AdminEquipmentPage /></AdminRoute>} />
          <Route path="/admin/reservations" element={<AdminRoute><AdminReservationsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;