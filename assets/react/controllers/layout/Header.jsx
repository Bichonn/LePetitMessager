import React from "react";

export default function Header() {
    return (
        <div className="container-fluid">
            <div className="row bg-blue">
                <div className="col-5 border border-dark d-flex justify-content-center align-items-center">
                    <h3>For You</h3>
                </div>

                
                <div className="col-2 border border-dark text-center">
                    <img src="/icons/logo-LPM.png" alt="logo" className="img-fluid w-50" />
                </div>


                <div className="col-5 border border-dark d-flex justify-content-center align-items-center">
                    <h3>Following</h3>
                </div>
            </div>
        </div>
    );
}