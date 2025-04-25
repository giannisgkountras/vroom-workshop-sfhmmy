import React, { useEffect, useState } from "react";
import ky from "ky";
import { FaRegTrashAlt } from "react-icons/fa";
const Admin = () => {
    const [submissions, setSubmissions] = useState([]);
    const [secret, setSecret] = useState("");
    const [tempSecret, setTempSecret] = useState("");
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    useEffect(() => {
        if (!secret) return;
        setLoading(true);
        const fetchSubmissions = async () => {
            try {
                const data = await ky
                    .get("submissions", {
                        prefixUrl: import.meta.env.VITE_API_BASE_URL,
                        headers: {
                            "Content-Type": "application/json",
                            "X-API-Key": secret
                        }
                    })
                    .json();
                setSubmissions(data);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();

        const fetchTeams = async () => {
            try {
                const data = await ky
                    .get("teams", {
                        prefixUrl: import.meta.env.VITE_API_BASE_URL,
                        headers: {
                            "Content-Type": "application/json",
                            "X-API-Key": secret
                        }
                    })
                    .json();
                setTeams(data);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };
        fetchTeams();
    }, [secret]);

    const handleDeleteSubmission = async (id) => {
        if (
            window.confirm("Are you sure you want to delete this submission?")
        ) {
            try {
                await ky.delete(`submissions/${id}`, {
                    prefixUrl: import.meta.env.VITE_API_BASE_URL,
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": secret
                    }
                });
                setSubmissions(submissions.filter((sub) => sub.id !== id));
            } catch (error) {
                console.error("Error deleting submission:", error);
                alert("Failed to delete submission.");
            }
        }
    };

    const handleDeleteTeam = async (id) => {
        if (window.confirm("Are you sure you want to delete this team?")) {
            try {
                await ky.delete(`teams/${id}`, {
                    prefixUrl: import.meta.env.VITE_API_BASE_URL,
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": secret
                    }
                });
                setTeams(teams.filter((team) => team.id !== id));
            } catch (error) {
                console.error("Error deleting team:", error);
                alert("Failed to delete team.");
            }
        }
    };

    return (
        <div className="w-full h-screen flex items-center justify-evenly gap-4 p-4">
            {secret === "" ? (
                <div className="flex flex-col gap-2">
                    <input
                        type="password"
                        placeholder="Enter secret"
                        className="border rounded p-2"
                        value={tempSecret}
                        onChange={(e) => setTempSecret(e.target.value)}
                    />
                    <button
                        onClick={() => setSecret(tempSecret)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Submit
                    </button>
                </div>
            ) : (
                <>
                    <div className="w-fit h-2/3 flex flex-col items-center justify-start gap-4 overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Submissions</h2>
                        {loading ? (
                            <p className="text-gray-500">
                                Loading submissions...
                            </p>
                        ) : submissions.length === 0 ? (
                            <p className="text-gray-500">
                                No submissions found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between p-4 bg-[#101928] shadow rounded-lg hover:bg-[#1a1f2b] transition duration-200"
                                    >
                                        <div className="flex-1">
                                            <span className="font-medium">
                                                ID: {sub.id}
                                            </span>
                                            <span className="ml-4">
                                                Team: {sub.team_id}
                                            </span>
                                            <span className="ml-4">
                                                Time: {sub.time_to_run}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleDeleteSubmission(sub.id)
                                            }
                                            className="ml-4 text-red-600 hover:text-red-800 focus:outline-none"
                                            title="Delete submission"
                                        >
                                            <FaRegTrashAlt />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="w-fit h-2/3 flex flex-col items-center justify-start gap-4 overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Teams</h2>
                        {loading ? (
                            <p className="text-gray-500">Loading teams...</p>
                        ) : teams.length === 0 ? (
                            <p className="text-gray-500">No teams found.</p>
                        ) : (
                            <div className="space-y-4">
                                {teams.map((team) => (
                                    <div
                                        key={team.id}
                                        className="flex items-center justify-between p-4 bg-[#101928] shadow rounded-lg hover:bg-[#1a1f2b] transition duration-200"
                                    >
                                        <div className="flex-1">
                                            <span className="font-medium">
                                                ID: {team.id}
                                            </span>
                                            <span className="ml-4">
                                                {team.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleDeleteTeam(team.id)
                                            }
                                            className="ml-4 text-red-600 hover:text-red-800 focus:outline-none"
                                            title="Delete submission"
                                        >
                                            <FaRegTrashAlt />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Admin;
