import { useTeam } from "../context/TeamContext";
import { useNavigate } from "react-router";
import splash from "../assets/splash.png";
import { registerCall, joinCall } from "../api/register";
import { useRef } from "react";
import { toast } from "react-toastify";
const Signup = () => {
    const { setTeamName, setTeamID } = useTeam();
    const navigate = useNavigate();
    const teamInputRef = useRef(null);

    const createTeam = (e) => {
        e.preventDefault();
        const teamName = teamInputRef.current.value;
        if (!teamName) {
            toast.error("Please enter a team name");
            return;
        }
        registerCall(teamName).then((response) => {
            if (response?.status === "success") {
                setTeamName(response.team_name); // Set in context
                setTeamID(response.team_id); // Set in context
                localStorage.setItem("teamID", response.team_id); // Store in local storage
                localStorage.setItem("teamName", response.team_name); // Store in local storage
                navigate("/");
            }
        });
    };

    const joinTeam = (e) => {
        e.preventDefault();
        const teamName = teamInputRef.current.value;
        if (!teamName) {
            toast.error("Please enter a team name");
            return;
        }
        joinCall(teamName).then((response) => {
            if (response?.status === "success") {
                setTeamName(teamName); // Set in context
                setTeamID(response.team_id); // Set in context
                localStorage.setItem("teamName", teamName); // Store in local storage
                localStorage.setItem("teamID", response.team_id); // Store in local storage
                navigate("/");
            }
        });
    };

    return (
        <div className="flex justify-evenly items-center h-screen w-screen">
            <div className="flex w-full flex-col h-full justify-center items-center">
                <h1 className="text-4xl font-bold">Welcome to</h1>
                <h1 className="text-4xl font-bold mb-12">VROOM's Workshop!</h1>
                <img src={splash} className="w-3/4"></img>
            </div>
            <div className="flex w-full flex-col h-full justify-center items-center">
                <h1 className="text-3xl font-bold mb-8">Register</h1>

                <div className="flex flex-col justify-center items-center">
                    <div className="text-lg text-start w-full mb-2">
                        Your team's name:
                    </div>
                    <input
                        ref={teamInputRef}
                        name="team"
                        placeholder="Super Cool Team Name"
                        required
                        className="w-96 h-14 px-4 text-lg mb-4 border border-purple-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <div className="flex w-full justify-center mb-2">
                        <button
                            className="mx-1 font-bold text-lg w-1/2 text-center border-1 border-purple-800  py-1 flex justify-evenly items-center rounded-lg cursor-pointer hover:bg-purple-950"
                            onClick={createTeam}
                        >
                            Create Team
                        </button>
                        <button
                            className="mx-1 font-bold text-lg w-1/2 text-center py-1 flex bg-purple-800 justify-evenly items-center rounded-lg cursor-pointer hover:bg-purple-950"
                            onClick={joinTeam}
                        >
                            Join Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
