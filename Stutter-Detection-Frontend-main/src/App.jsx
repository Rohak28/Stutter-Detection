import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import PatientHistory from "./pages/PatientHistory";
import Documentation from "./pages/Documentation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Privacy from "./pages/Privacy"
import Terms from "./pages/Terms"
import Contact from "./pages/Contact"
import PrivateRoute from "./components/PrivateRoute";
import PatientInfo from "./pages/PatientInfo";
import SLPPatients from "./pages/SLPPatients";
import AllResults from "./pages/AllResults";
import SharedResult from "./pages/SharedResult";
import SLPProfile from "./pages/SLPProfile";
import SLPDirectory from "./pages/SLPDirectory";
import AdminDashboard from "./pages/AdminDashboard";
import SLPDashboard from "./pages/SLPDashboard";
import SLPPatientDetail from "./pages/SLPPatientDetail";
import Settings from "./pages/Settings";

// Admin-only route guard (for normal admin)
function AdminRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/patient-info" element={<PatientInfo />} />

            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <PatientHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute>
                  <SLPPatients />
                </PrivateRoute>
              }
            />
            <Route
              path="/slp-dashboard"
              element={
                <PrivateRoute>
                  <SLPDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/slp-patient-detail"
              element={
                <PrivateRoute>
                  <SLPPatientDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/analyze"
              element={
                <PrivateRoute>
                  <Analyze />
                </PrivateRoute>
              }
            />
            <Route
              path="/results"
              element={
                <PrivateRoute>
                  <Results />
                </PrivateRoute>
              }
            />
            <Route path="/documentation" element={<Documentation />} />
            <Route
              path="/all-results"
              element={
                <PrivateRoute>
                  <AllResults />
                </PrivateRoute>
              }
            />
            <Route path="/shared/:token" element={<SharedResult />} />
            <Route
              path="/slp-profile"
              element={
                <PrivateRoute>
                  <SLPProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/find-slp"
              element={
                <PrivateRoute>
                  <SLPDirectory />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
