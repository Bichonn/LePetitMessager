import React from "react";

export default function Header() {
    return (
        // Main container for the header
        <div className="container-fluid">
            <div className="row border-start border-bottom border-end border-dark">

                {/* Center section with the logo */}
                <div className="col-2 text-center border-end border-dark border-2">
                    <img src="/icons/logo-LPM.png" alt="logo" className="img-fluid w-75" />
                </div>

                {/* Title section */}
                <div className="col-10 text-center my-3">
                    <h3 className="text-decoration-underline">Partagez vos pensées avec les autres Messagers</h3>
                </div>

            </div>
        </div>
    );
}