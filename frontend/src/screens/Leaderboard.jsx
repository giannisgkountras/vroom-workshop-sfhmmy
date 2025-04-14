import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { getLeaderboard } from "../api/leaderboard";
const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);

    const fetchLeaderboard = async () => {
        const response = await getLeaderboard();
        if (response?.status === "success") {
            setLeaderboardData(response.leaderboard);
            console.log(response.leaderboard);
        } else {
            console.error("Error fetching leaderboard data");
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // reload leaderboard data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLeaderboard();
        }, 10000);
        return () => clearInterval(interval);
    }, []);
    return (
        <>
            <Navigation
                screens={[
                    { url: "/", title: "Submit Code" },
                    { url: "/leaderboard", title: "Leaderboard" }
                ]}
            />
            <div className="flex flex-col items-center justify-start h-full w-full ">
                <div className="overflow-x-auto w-1/3 mt-12">
                    <table className="min-w-full bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
                        <thead className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">
                                    Team Name
                                </th>
                                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">
                                    Time Taken
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {leaderboardData.map((team, index) => {
                                let rankClass = "";
                                if (index === 0)
                                    rankClass =
                                        "bg-[#ffbe48]/40 text-yellow-300";
                                else if (index === 1)
                                    rankClass = "bg-[#84abc8]/40";
                                else if (index === 2)
                                    rankClass = "bg-[#bda69f]/30";
                                else rankClass = "bg-[#111828] text-white";

                                return (
                                    <tr
                                        key={index}
                                        className={`transition-colors duration-200 ${rankClass}`}
                                    >
                                        <td className="px-6 py-4 font-bold">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            {team.team_name}
                                        </td>
                                        <td className="px-6 py-4 text-green-400 font-semibold">
                                            {team.fastest_time} s
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Leaderboard;
