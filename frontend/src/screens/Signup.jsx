import { useTeam } from "../context/TeamContext";
import { useNavigate } from "react-router";
import splash from "../assets/splash.png";
import { registerCall } from "../api/register";

const Signup = () => {
    const { setTeamName } = useTeam();
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        const teamName = e.target.team.value;
        const secretKey = e.target.secret.value;
        registerCall(teamName, secretKey).then((response) => {
            if (response?.status === "success") {
                setTeamName(teamName); // Set in context
                localStorage.setItem("teamName", teamName); // Store in local storage
                navigate("/");
            }
        });
    };

    return (
        <div className="flex justify-evenly items-center h-screen w-screen">
            <div className="flex w-full flex-col h-full justify-center items-center">
                <h1 className="text-4xl font-bold">Welcome to</h1>
                <h1 className="text-4xl font-bold mb-12">VROOM's Workshop!</h1>
                <img src={splash} className="w-2/3"></img>
            </div>
            <div className="flex w-full flex-col h-full justify-center items-center">
                <h1 className="text-3xl font-bold mb-8">Register</h1>

                <form
                    onSubmit={handleSignup}
                    className="flex flex-col items-center"
                >
                    <div className="text-lg text-start w-full mb-2">
                        Your team's name:
                    </div>
                    <input
                        name="team"
                        placeholder="Super Cool Team Name"
                        required
                        className="w-96 h-14 px-4 text-lg mb-4 border border-purple-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="text-lg text-start w-full mb-2">
                        Your team's secret key:
                    </div>
                    <input
                        name="secret"
                        placeholder="xxxxxx"
                        required
                        className="w-96 h-14 text-lg px-4 mb-4 border border-purple-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        className="mr-2 font-bold text-lg w-1/3 text-center bg-purple-800 px-4 py-1 flex justify-evenly items-center rounded-lg cursor-pointer hover:bg-purple-950"
                        type="submit"
                    >
                        Begin
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
