import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Applications from "./pages/Applications/Applications.jsx";
import Resumes from "./pages/Resumes/Resumes.jsx";
import Contacts from "./pages/Contacts/Contacts.jsx";
import Deadlines from "./pages/Deadlines/Deadlines.jsx";
import Analytics from "./pages/Analytics/Analytics.jsx";
import { authAPI } from "./utils/api.js";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await authAPI.getMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      /* proceed with local logout regardless */
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="spinner" style={{ minHeight: "100vh" }}>
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Register onLogin={handleLogin} />
          )
        }
      />
      <Route
        element={
          <ProtectedRoute user={user}>
            <Layout user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/deadlines" element={<Deadlines />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
