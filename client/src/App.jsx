import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailConfirmation from "./pages/Emailconfirmation";
import ForgotPassword from "./pages/ForgotPassword";
import Reports from "./pages/Reports";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Product from "./pages/Product";
import Profile from "./pages/Profile";
import Material from "./pages/Material";
import Sales from "./pages/Sales";
import { ProfileProvider } from "./components/ProfileContext";
import Expense from "./pages/Expense";
import MaterialProduct from "./pages/MaterialProduct";
import VerificationSuccess from "./pages/VerificationSucces";
import ResetPassword from "./pages/ResetPassword";
import ProductList from "./pages/ProductList";

const AppContent = ({ showMobileMenu, setShowMobileMenu }) => {
  const location = useLocation();
  
  const showNavbar = ["/reports", "/product", "/profile", "/material", "/sales", "/expense"].some(path => location.pathname.startsWith(path));

  const showSidebar = ["/reports", "/product", "/profile", "/material", "/sales", "/expense", "/materialproduct"].some(path => location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'has-sidebar' : ''}`}>
        {showNavbar && <Navbar />}
        <div className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/materialproduct/:productName" element={<MaterialProduct />} />
            <Route path="/product" element={<Product />} />
            <Route path="/material" element={<Material />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/verification-success" element={<VerificationSuccess />} />
            <Route path="/verification-error" element={<VerificationSuccess />} />
            <Route path="/product" element={<ProductList />} />
            <Route path="/product/:productId" element={<MaterialProduct />} />
            <Route path="/" element={<Navigate to="/product" replace />} />
            <Route path="*" element={<div>Page not found</div>} />
            <Route
              path="/reports"
              element={
                <Reports
                  showMobileMenu={showMobileMenu}
                  setShowMobileMenu={setShowMobileMenu}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

AppContent.propTypes = {
  showMobileMenu: PropTypes.bool.isRequired,
  setShowMobileMenu: PropTypes.func.isRequired,
};

function App() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <ProfileProvider>
      <Router>
        <AppContent
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
        />
      </Router>
    </ProfileProvider>
  );
}

export default App;