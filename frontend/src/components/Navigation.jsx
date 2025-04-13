import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router";
import { FiLogOut } from "react-icons/fi";
const NavBar = ({ screens }) => {
    const [activeUrl, setActiveUrl] = useState("");
    const location = useLocation();
    const teamName = localStorage.getItem("teamName");
    useEffect(() => {
        // Normalize URLs by removing trailing slashes
        const currentPath = location.pathname.replace(/\/$/, "");
        const matchingScreen = screens.find(
            (screen) => currentPath === screen.url.replace(/\/$/, "")
        );

        if (matchingScreen) {
            setActiveUrl(matchingScreen.url);
        }
    }, [location.pathname, screens]);

    const handleLogout = () => {
        localStorage.removeItem("teamName");
        window.location.href = "/signup";
    };

    return (
        <div className="w-full h-[56px] top-0 flex justify-center bg-[#111828] ">
            <div className="w-full flex justify-start items-center px-4">
                <h1 className="text-lg font-bold">
                    Welcome <span className="text-purple-400">{teamName}</span>
                </h1>
            </div>

            <div className="w-1/2 h-full flex items-center justify-evenly gap-4">
                {screens.map((screen) => {
                    const isActive = activeUrl === screen.url;
                    return (
                        <Link
                            key={screen.url} // Use URL as unique key
                            to={screen.url}
                            className={`text-lg w-full text-center font-bold px-4 py-2 transition-all ${
                                isActive
                                    ? "border-b-2 border-white text-white"
                                    : "text-gray-600 hover:border-b-2 "
                            }`}
                        >
                            {screen.title}
                        </Link>
                    );
                })}
            </div>
            <div className="w-full flex justify-end items-center px-4">
                <button
                    className="mr-2 text-lg font-bold text-center bg-radial from-purple-600 to-purple-700 px-2 py-1 flex justify-evenly items-center rounded-xl cursor-pointer hover:bg-gray-600"
                    onClick={handleLogout}
                >
                    Logout <FiLogOut className="ml-2" />
                </button>
            </div>
        </div>
    );
};

export default NavBar;
