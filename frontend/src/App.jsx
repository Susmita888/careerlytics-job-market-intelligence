
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";

import Nav from "./components/Nav.jsx";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import Resume from "./pages/Resume.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Analytics from "./pages/Analytics.jsx";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";

function Private({ children }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090D1A] text-slate-300">
        Loading Careerlytics...
      </main>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PageLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#090D1A] px-4 pb-16 pt-6 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        {children}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Nav />

      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Authentication */}
        <Route
          path="/login"
          element={
            <PageLayout>
              <Auth mode="login" />
            </PageLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PageLayout>
              <Auth mode="register" />
            </PageLayout>
          }
        />

        {/* Public pages */}
        <Route
          path="/jobs"
          element={
            <PageLayout>
              <Jobs />
            </PageLayout>
          }
        />

        <Route
          path="/analytics"
          element={
            <PageLayout>
              <Analytics />
            </PageLayout>
          }
        />

        {/* Protected pages */}
        <Route
          path="/dashboard"
          element={
            <Private>
              <PageLayout>
                <Dashboard />
              </PageLayout>
            </Private>
          }
        />

        <Route
          path="/resume"
          element={
            <Private>
              <PageLayout>
                <Resume />
              </PageLayout>
            </Private>
          }
        />

        <Route
          path="/recommendations"
          element={
            <Private>
              <PageLayout>
                <Recommendations />
              </PageLayout>
            </Private>
          }
        />

        <Route
          path="/skill-gap"
          element={
            <Private>
              <PageLayout>
                <SkillGap />
              </PageLayout>
            </Private>
          }
        />

        <Route
          path="/roadmap"
          element={
            <Private>
              <PageLayout>
                <Roadmap />
              </PageLayout>
            </Private>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
