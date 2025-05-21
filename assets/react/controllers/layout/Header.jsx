import React from "react";

export default function Header() {
    return (
        <div className="container-fluid">
            <div className="row border-start border-bottom border-end border-dark">
                <div className="col-5 d-flex justify-content-center align-items-center pb-1">
                    <h3>For You</h3>
                </div>

                
                <div className="col-2 text-center border-start border-end border-dark border-2 pb-1">
                    <img src="/icons/logo-LPM.png" alt="logo" className="img-fluid w-50" />
                </div>


                <div className="col-5 d-flex justify-content-center align-items-center pb-1">
                    <h3>Following</h3>
                </div>
            </div>
        </div>
    );
}