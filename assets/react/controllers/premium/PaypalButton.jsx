import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PaypalButton({ onPaymentSuccess }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Devenez un grand messager
      </button>
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
                        purchase_units: [{ amount: { value: "0.05" } }],
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
