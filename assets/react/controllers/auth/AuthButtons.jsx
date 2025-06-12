import React from "react";
import LoginForm from "../auth/LoginForm";
import RegisterForm from "../auth/RegisterForm";
import LogOut from "../auth/LogOut";
import PaypalButton from "../premium/PaypalButton";

export default function AuthButtons({ isAuthenticated = false, username = null, logoutPath = null }) {
  return !isAuthenticated ? (
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
    <>
      <LogOut username={username} logoutPath={logoutPath} />
      <PaypalButton onPaymentSuccess={() => window.location.reload()} />
    </>
  );
}