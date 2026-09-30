import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";

import { useFleet } from "./context/fleetContext";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import AddVehicle from "./pages/AddVehicle";
import VehicleDetails from "./pages/VehicleDetails";
import EditVehicle from "./pages/EditVehicle";

import Documents from "./pages/Documents";
import AddDocument from "./pages/AddDocument";

import EMI from "./pages/EMI";
import AddLoan from "./pages/AddLoan";
import EMIDetails from "./pages/EMIDetails";

import Challans from "./pages/Challans";
import AddChallan from "./pages/AddChallan";

import ExpenseOverview from "./pages/ExpenseOverview";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Reminders from "./pages/Reminders";

import Users from "./pages/Users";
import AddUser from "./pages/AddUser";

import Settings from "./pages/Settings";

import NotFound from "./pages/NotFound";

import Premium from "./pages/Premium";


// ============================================================
// APP LAYOUT
// ============================================================

function AppLayout({ children }) {
  return <Layout>{children}</Layout>;
}


// ============================================================
// MAIN PORTAL ENTRY
// ============================================================

function PortalStart() {
  const welcomeSeen =
    sessionStorage.getItem("fleetdoc_welcome_seen") === "true";

  const loggedIn =
    localStorage.getItem("fleetdoc_logged_in") === "true";


  // ----------------------------------------------------------
  // First time opening the portal
  // ----------------------------------------------------------

  if (!welcomeSeen) {
    return <Navigate to="/welcome" replace />;
  }


  // ----------------------------------------------------------
  // Welcome video already completed but user is not logged in
  // ----------------------------------------------------------

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }


  // ----------------------------------------------------------
  // User is logged in → Dashboard
  // ----------------------------------------------------------

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}


// ============================================================
// LOGIN GATE
// ============================================================

function LoginGate() {
  const welcomeSeen =
    sessionStorage.getItem("fleetdoc_welcome_seen") === "true";


  // User cannot skip the welcome video
  if (!welcomeSeen) {
    return <Navigate to="/welcome" replace />;
  }


  return <Login />;
}


// ============================================================
// AUTHENTICATED ROUTE
// ============================================================

function AuthenticatedRoute({ children }) {
  const location = useLocation();

  const loggedIn =
    localStorage.getItem("fleetdoc_logged_in") === "true";


  // If user is not logged in, send them to Login
  if (!loggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  return <AppLayout>{children}</AppLayout>;
}


// ============================================================
// APP
// ============================================================

function RuntimePreferences({ children }) {
  const { settings } = useFleet();

  const theme = settings?.theme || "light";
  const animationsEnabled = settings?.animationsEnabled ?? settings?.animations ?? true;
  const compactTables = Boolean(settings?.compactTables);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", isDark);
      root.dataset.theme = isDark ? "dark" : "light";
      body.classList.toggle("dark", isDark);
    };

    applyTheme();
    if (theme === "system") media.addEventListener?.("change", applyTheme);
    return () => media.removeEventListener?.("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("fleetdoc-compact", compactTables);
  }, [compactTables]);

  useEffect(() => {
    document.body.classList.toggle("fleetdoc-animations-off", !animationsEnabled);
  }, [animationsEnabled]);

  useEffect(() => {
    if (!localStorage.getItem("fleetdoc_logged_in")) return undefined;

    const timeoutMinutes = Number(settings?.sessionTimeout);
    if (!Number.isFinite(timeoutMinutes) || timeoutMinutes <= 0) return undefined;

    let timer;
    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        localStorage.removeItem("fleetdoc_logged_in");
        localStorage.removeItem("fleetdoc_user_id");
        localStorage.removeItem("fleetdoc_user_email");
        localStorage.removeItem("fleetdoc_user_name");
        localStorage.removeItem("fleetdoc_user_role");
        window.location.replace("/login");
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [settings?.sessionTimeout]);

  return (
    <MotionConfig
      reducedMotion={animationsEnabled ? "never" : "always"}
      transition={animationsEnabled ? undefined : { duration: 0 }}
    >
      {children}
    </MotionConfig>
  );
}

function AppRoutes() {
  return (
    <RuntimePreferences>
      <Routes>

        {/* ======================================================
            WELCOME VIDEO
            ====================================================== */}

        <Route
          path="/welcome"
          element={<Welcome />}
        />


        {/* ======================================================
            LOGIN
            ====================================================== */}

        <Route
          path="/login"
          element={<LoginGate />}
        />


        {/* ======================================================
            DASHBOARD
            ====================================================== */}

        <Route
          path="/"
          element={<PortalStart />}
        />


        {/* ======================================================
            VEHICLES
            ====================================================== */}

        <Route
          path="/vehicles"
          element={
            <AuthenticatedRoute>
              <Vehicles />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/vehicles/add"
          element={
            <AuthenticatedRoute>
              <AddVehicle />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/vehicles/:id"
          element={
            <AuthenticatedRoute>
              <VehicleDetails />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/vehicles/:id/edit"
          element={
            <AuthenticatedRoute>
              <EditVehicle />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            DOCUMENTS
            ====================================================== */}

        <Route
          path="/documents"
          element={
            <AuthenticatedRoute>
              <Documents />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/documents/add"
          element={
            <AuthenticatedRoute>
              <AddDocument />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            EMI
            ====================================================== */}

        <Route
          path="/emi"
          element={
            <AuthenticatedRoute>
              <EMI />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/emi/add-loan"
          element={
            <AuthenticatedRoute>
              <AddLoan />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/emi/details/:vehicleNumber"
          element={
            <AuthenticatedRoute>
              <EMIDetails />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            CHALLANS
            ====================================================== */}

        <Route
          path="/challans"
          element={
            <AuthenticatedRoute>
              <Challans />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/challans/add"
          element={
            <AuthenticatedRoute>
              <AddChallan />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            EXPENSE OVERVIEW
            ====================================================== */}

        <Route
          path="/Expense-Overview"
          element={
            <AuthenticatedRoute>
              <ExpenseOverview />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/road-tax"
          element={<Navigate to="/Expense-Overview" replace />}
        />


        {/* ======================================================
            NOTIFICATIONS
            ====================================================== */}

        <Route
          path="/notifications"
          element={
            <AuthenticatedRoute>
              <Notifications />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            REPORTS
            ====================================================== */}

        <Route
          path="/reports"
          element={
            <AuthenticatedRoute>
              <Reports />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            REMINDERS
            ====================================================== */}

        <Route
          path="/reminders"
          element={
            <AuthenticatedRoute>
              <Reminders />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            USERS
            ====================================================== */}

        <Route
          path="/users"
          element={
            <AuthenticatedRoute>
              <Users />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/users/add"
          element={
            <AuthenticatedRoute>
              <AddUser />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/users/edit/:id"
          element={
            <AuthenticatedRoute>
              <AddUser />
            </AuthenticatedRoute>
          }
        />

        {/* ======================================================
            SETTINGS
            ====================================================== */}

        <Route
          path="/settings"
          element={
            <AuthenticatedRoute>
              <Settings />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            PREMIUM
            ====================================================== */}

        <Route
          path="/premium"
          element={
            <AuthenticatedRoute>
              <Premium />
            </AuthenticatedRoute>
          }
        />


        {/* ======================================================
            404
            ====================================================== */}

        <Route
          path="/404"
          element={<NotFound />}
        />


        {/* ======================================================
            UNKNOWN ROUTE
            ====================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/404"
              replace
            />
          }
        />

      </Routes>
    </RuntimePreferences>
  );
}

export default function App() {
  return <AppRoutes />;
}