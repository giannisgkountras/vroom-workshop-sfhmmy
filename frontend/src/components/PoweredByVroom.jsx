import React from "react";
import vroomLogo from "../assets/vroom_logo.png";

const PoweredByVroom = () => {
    return (
        <div className="fixed bottom-0 w-full flex justify-center items-center">
            <div className="flex justify-center items-center w-ful p-2">
                <img src={vroomLogo} alt="VROOM Logo" className="h-5 mr-1" />
                <h1 className="text-white">
                    Powered by{" "}
                    <a
                        href="https://vroom.web.auth.gr//"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-pink-700"
                    >
                        VROOM
                    </a>
                </h1>
            </div>
        </div>
    );
};

export default PoweredByVroom;
