import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const Play = lazy(() => import("./pages/Play"));
const Admin = lazy(() => import("./pages/Admin"));

import { LoadingProvider } from "./context/LoadingProvider";
import { PortfolioProvider } from "./context/PortfolioContext";

// Auth related imports
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <LoadingProvider>
                  <Suspense fallback={<div className="h-screen flex justify-center items-center">Loading...</div>}>
                    <MainContainer>
                      <Suspense fallback={null}>
                        <CharacterModel />
                      </Suspense>
                    </MainContainer>
                  </Suspense>
                </LoadingProvider>
              }
            />
            <Route
              path="/myworks"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <MyWorks />
                </Suspense>
              }
            />
            <Route
              path="/play"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <Play />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                </Suspense>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </PortfolioProvider>
    </AuthProvider>
  );
};

export default App;
