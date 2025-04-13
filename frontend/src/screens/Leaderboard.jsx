import React from "react";
import Navigation from "../components/Navigation";

const Leaderboard = () => {
    return (
        <div>
            <Navigation
                screens={[
                    { url: "/", title: "Submit" },
                    { url: "/leaderboard", title: "Leaderboard" }
                ]}
            />
        </div>
    );
};

export default Leaderboard;
