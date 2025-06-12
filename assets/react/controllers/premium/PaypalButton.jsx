import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PaypalButton({ onPaymentSuccess }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="paypal-button-container text-center border-top border-bottom border-dark p-4">
        <div className="mb-3">
          <h3 className="text-decoration-underline">Devenez un grand messager !</h3>
          <p className="fw-bold">En devenant Premium, vous bénéficiez de :</p>
          <ul className="list-unstyled">
            <li>• <span className="premium-benefit-text">Un badge spécial sur votre profil</span></li>
            <li>• <span className="premium-benefit-text">Plus de caractères pour vos posts</span></li>
            <li>• <span className="premium-benefit-text">La possibilité d'uploader plusieurs médias par post</span></li>
          </ul>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Passer Premium
        </button>
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Paiement Premium</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <PayPalScriptProvider options={{ "client-id": "AZCrzgiABqGSt1faUjds74y9qOOJs3ACp_Sy6-ZyEAsDJmFj5iLg5AK9xFYNRnaNJaUgvJ-6KPNoEeD6", currency: "EUR", locale: "fr_FR" }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'silver', shape: 'rect', label: 'paypal' }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [{ amount: { value: "6.99" } }],
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order.capture().then((details) => {
                        const orderID = details.id;
                        fetch("/user/premium", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "X-Requested-With": "XMLHttpRequest"
                          },
                          body: JSON.stringify({ paypalOrderId: orderID })
                        })
                          .then(res => res.json())
                          .then(() => {
                            setShowModal(false);
                            if (onPaymentSuccess) onPaymentSuccess();
                          });
                      });
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
