import { ChakraProvider, Flex } from "@chakra-ui/react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import theme from "./theme/theme";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 🌿 Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import MeetTheTeam from "./pages/MeetTheTeam";
import AdminDashboard from "./pages/AdminDashboard";
import BookNow from "./pages/BookNow";
import ContactUs from "./pages/ContactUs";
import Careers from "./pages/Careers";

// 🌿 Service Detail Pages
import IndividualTherapy from "./pages/IndividualTherapy";
import CouplesTherapy from "./pages/CouplesTherapy";
import AdolescentTherapy from "./pages/AdolescentTherapy";
import GroupSupportCircles from "./pages/GroupSupportCircles";
import Supervision from "./pages/Supervision";
import MindfulnessRelaxation from "./pages/MindfulnessAndRelaxation";
import TrainingPrograms from "./pages/TrainingAndPrograms";
import Client from "./pages/Client";
import Therapists from "./pages/Therapists";
import TherapistApply from "./pages/TherapistApply";
import ClientSignup from "./pages/ClientSignup";
import ClientCheckinQuiz from "./pages/ClientCheckinQuiz";
import TherapistSignupPreview from "./pages/TherapistSignupPreview";
import TherapistDiscovery from "./pages/TherapistDiscovery";
import TherapistProfileDetail from "./pages/TherapistProfileDetail";

// 🩺 Therapist Dashboard Pages
import RoleSelectionLogin from "./pages/login/RoleSelectionLogin";
import ClientLogin from "./pages/login/ClientLogin";
import TherapistLogin from "./pages/login/TherapistLogin";
import TherapistDashboard from "./pages/dashboards/TherapistDashboard";
import Clients from "./pages/dashboards/Clients";
import ClientProfile from "./pages/dashboards/ClientProfile";
import ClientInfo from "./pages/dashboards/ClientInfo";
import ClientNotes from "./pages/dashboards/ClientNotes";
import ClientFiles from "./pages/dashboards/ClientFiles";
import ClientAppointments from "./pages/dashboards/ClientAppointments";
import AppointmentDetail from "./pages/dashboards/AppointmentDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardRouter from "./pages/dashboards/DashboardRouter";
import ClientDashboard from "./pages/dashboards/ClientDashboard";

/**
 * 🌸 AppLayout:
 * Keeps Navbar & Footer consistent across all public pages.
 * You can later hide Navbar/Footer on dashboard routes by
 * changing `showNavbar` or checking the pathname.
 */
function AppLayout({ children }) {
  const { pathname } = useLocation();
  const showNavbar = !pathname.startsWith("/dashboard"); // hides Navbar on dashboard pages if needed
  const baseOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://mlchealth.in";
  const canonicalUrl = `${baseOrigin}${pathname}`;
  const isPrivateRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/login/therapist");

  return (
    <Flex direction="column" minH="100vh" bg="rgba(169, 203, 183, 0.12)">
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MLC Health & Wellness Centre" />
        <meta
          property="og:title"
          content="MLC Health & Wellness Centre | Online Therapy Across India"
        />
        <meta
          property="og:description"
          content="Structured, ethical, and emotionally attuned online therapy across India. Individual, couples, adolescent therapy and clinician development programs."
        />
        <meta property="og:image" content={`${baseOrigin}/hero-bg.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MLC Health & Wellness Centre" />
        <meta
          name="twitter:description"
          content="Structured, ethical online therapy across India for individuals, couples, adolescents, and clinicians."
        />
        <meta name="twitter:image" content={`${baseOrigin}/hero-bg.jpg`} />
        {isPrivateRoute && <meta name="robots" content="noindex,nofollow" />}
      </Helmet>
      {showNavbar && <Navbar />}
      <Flex as="main" flex="1" direction="column">
        {children}
      </Flex>
      {showNavbar && <Footer />}
    </Flex>
  );
}

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <HelmetProvider>
        <Router>
          <AppLayout>
            <Routes>
              {/* 🌿 Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/meettheteam" element={<MeetTheTeam />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/book" element={<BookNow />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/client" element={<Client />} />
              <Route path="/client-checkin" element={<ClientCheckinQuiz />} />
              <Route path="/therapists" element={<Therapists />} />
              <Route path="/therapists/discovery" element={<TherapistDiscovery />} />
              <Route path="/therapists/:id" element={<TherapistProfileDetail />} />
              <Route path="/therapist-apply" element={<TherapistApply />} />
              <Route path="/signup/client" element={<ClientSignup />} />
              <Route
                path="/signup/therapist"
                element={<TherapistSignupPreview />}
              />
              <Route
                path="/signup/therapist-preview"
                element={<Navigate to="/signup/therapist" replace />}
              />

              {/* 🌸 Service Detail Pages */}
              <Route path="/individual-therapy" element={<IndividualTherapy />} />
              <Route path="/couples-therapy" element={<CouplesTherapy />} />
              <Route path="/adolescent-therapy" element={<AdolescentTherapy />} />
              <Route
                path="/group-support-circles"
                element={<GroupSupportCircles />}
              />
              <Route path="/supervision" element={<Supervision />} />
              <Route
                path="/mindfulness-relaxation"
                element={<MindfulnessRelaxation />}
              />
              <Route
                path="/mindfulness"
                element={<MindfulnessRelaxation />}
              />
              <Route path="/training-programs" element={<TrainingPrograms />} />
              <Route
                path="/group-therapy"
                element={<GroupSupportCircles />}
              />

              {/* 🩺 Authentication & Dashboard */}
              <Route path="/login" element={<RoleSelectionLogin />} />
              <Route path="/login/client" element={<ClientLogin />} />
              <Route path="/login/therapist" element={<TherapistLogin />} />
              <Route path="/dashboard" element={<DashboardRouter />} />

              <Route
                path="/dashboard/therapist"
                element={
                  <ProtectedRoute allowRoles={["therapist", "admin"]}>
                    <TherapistDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/therapist/clients"
                element={
                  <ProtectedRoute allowRoles={["therapist", "admin"]}>
                    <Clients />
                  </ProtectedRoute>
                }
              />

              {/* 🧠 Client Profile Nested Routes */}
              <Route
                path="/dashboard/therapist/clients/:id"
                element={
                  <ProtectedRoute allowRoles={["therapist", "admin"]}>
                    <ClientProfile />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="info" replace />} />
                <Route path="info" element={<ClientInfo />} />
                <Route path="notes" element={<ClientNotes />} />
                <Route path="files" element={<ClientFiles />} />
                <Route path="appointments" element={<ClientAppointments />} />
              </Route>

              <Route
                path="/dashboard/therapist/appointments/:id"
                element={
                  <ProtectedRoute allowRoles={["therapist", "admin"]}>
                    <AppointmentDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/client"
                element={
                  <ProtectedRoute>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 🪶 Fallback: anything unknown → Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </HelmetProvider>
    </ChakraProvider>
  );
}
