import { useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Router from "./routes/Router";
import { ToastContainer } from "react-toastify";
import TermsAndConditionsGate from "./components/TermsAndConditionsModal";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <TermsAndConditionsGate>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {/* Render Public Navbar only for customer routes */}
        {!isAdminRoute && <Navbar />}

        <div className="flex-grow">
          <Router />
        </div>

        {/* Render Public Footer only for customer routes */}
        {!isAdminRoute && <Footer />}
      </div>
    </TermsAndConditionsGate>
  );
}
