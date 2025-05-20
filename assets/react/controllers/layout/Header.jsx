import React from "react";

export default function Header() {
    return (
        <div class="container-fluid">
            <div class="row bg-blue">
                <div class="col-5 border border-dark d-flex justify-content-center align-items-center">
                    <h3>For You</h3>
                </div>

                
                <div class="col-2 border border-dark text-center">
                    <img src="/icons/logo-LPM.png" alt="logo" className="img-fluid w-50" />
                </div>


                <div class="col-5 border border-dark d-flex justify-content-center align-items-center">
                    <h3>Following</h3>
                </div>
            </div>
        </div>
    );
}