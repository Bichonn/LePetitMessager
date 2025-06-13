import React from "react";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import LogOut from "../auth/LogOut";
import PaypalButton from "../premium/PaypalButton"; // Import for PayPal button

// Component to display authentication buttons or user information
export default function AuthButtons({ isAuthenticated = false, username = null, logoutPath = null }) {
  return !isAuthenticated ? (
    // Display login and register forms if user is not authenticated
    <div className="container border-bottom border-top border-dark">
      <div className="d-flex justify-content-center mb-1 mt-3">
        <h5 className="text-center text-decoration-underline">Messager ! à votre plume !</h5>
      </div>
      <div className="d-flex justify-content-center mb-3">
        <LoginForm />
        <RegisterForm />
      </div>
    </div>
  ) : (
    // Display logout button and PayPal button if user is authenticated
    <>
      <LogOut username={username} logoutPath={logoutPath} />
      <PaypalButton onPaymentSuccess={() => window.location.reload()} /> {/* Reload page on successful payment */}
    </>
  );
}