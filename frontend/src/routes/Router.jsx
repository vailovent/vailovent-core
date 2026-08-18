import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CartPage from "../pages/CartPage";
import PaymentHistoryPage from "../pages/PaymentHistoryPage";
import SignInPage from "../pages/SignInPage";
import ProtectedRoute from "../components/ProtectRoute";
import PaymentStatus from "../pages/PaymentStatusPage";
import ProductList from "../pages/ProductListPage";
import TermsPage from "../pages/TermsPage";
import PrivacyPage from "../pages/PrivacyPage";
import NotFoundPage from "../pages/NotFoundPage";

export default function RouterComponent() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public Routes */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/payment-status" element={<PaymentStatus />} />
      <Route path="/admin/signin" element={<SignInPage />} />

      {/* Legal Pages — diperlukan oleh link di modal Terms & Conditions (CRITICAL-45) */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Protected Admin Routes */}
      <Route path="/admin">
        <Route
          path="transaction"
          element={
            <ProtectedRoute>
              <PaymentHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="transaction/:status"
          element={
            <ProtectedRoute>
              <PaymentHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="products"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="products/:product_id"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

