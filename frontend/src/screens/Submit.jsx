import React, { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import CodeEditor from "../components/CodeEditor";
import placeholder from "../assets/placeholderimage";
import { toast } from "react-toastify";
import { RiResetLeftFill } from "react-icons/ri";
import { submitCode } from "../api/submitCode";
import Loading from "../components/Loading";
import initialPythonCode from "../assets/initialCode";
import { getMyTeamsFastestTime } from "../api/leaderboard";

const Submit = () => {
    const initialCode = initialPythonCode;
    const [code, setCode] = useState(
        localStorage.getItem("code") || initialCode
    );

    const [showSure, setShowSure] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageResult, setImageResult] = useState(placeholder);
    const [timeTaken, setTimeTaken] = useState(0);
    const [bestTime, setBestTime] = useState(0);
    const [codeError, setCodeError] = useState("");
    const [output, setOutput] = useState("");
    const resetCode = () => {
        toast.success("Code reset successfully!");
        setShowSure(false);
        setCode(initialCode);
        localStorage.setItem("code", initialCode);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setCodeError("");
        setOutput("");
        const teamID = localStorage.getItem("teamID");
        if (!teamID) {
            toast.error("Team ID not found!");
            return;
        }
        const response = await submitCode(teamID, code);
        if (response?.status === "success") {
            if (response?.image === "") {
                toast.error("No image generated!");
                // setImageResult(placeholder);
            } else {
                setImageResult(response.image);
            }
            setTimeTaken(response.time_to_run);
            setOutput(response.output);
            // setBestTime(response.best_time);
        } else {
            setCodeError(response?.message);
        }
        setLoading(false);
        updateMyFastestTime();
    };

    const updateMyFastestTime = () => {
        const teamID = localStorage.getItem("teamID");
        if (!teamID) {
            toast.error("Team ID not found!");
            return;
        }
        getMyTeamsFastestTime(teamID).then((response) => {
            if (response?.status === "success") {
                setBestTime(response.fastest_time);
            } else {
                setCodeError(response?.message);
            }
        });
    };

    useEffect(() => {
        updateMyFastestTime();
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
                <div className="flex w-full h-full justify-evenly items-start">
                    <div className="w-3/5 h-full flex flex-col justify-start items-center border-r-3 border-[#111929]">
                        <h1 className="text-3xl font-bold text-white mb-4 mt-4 text-start w-11/12">
                            Implement your solution
                        </h1>
                        <div className="flex w-11/12 items-center justify-between h-fit mb-4">
                            <h2 className="mb-2 text-gray-200">
                                Make sure you name your function{" "}
                                <span className="font-mono text-purple-400">
                                    calculate_path
                                </span>
                            </h2>
                            {showSure && (
                                <button
                                    className="bg-red-500 font-semibold text-white rounded-lg px-2 py-1 cursor-pointer hover:bg-red-900"
                                    onClick={resetCode}
                                >
                                    Click again to confirm reset
                                </button>
                            )}
                            {!showSure && (
                                <button
                                    className="bg-red-500 font-semibold text-white rounded-lg px-2 py-1 cursor-pointer flex justify-center items-center hover:bg-red-900"
                                    onClick={() => {
                                        setShowSure(true);
                                    }}
                                >
                                    <RiResetLeftFill className="text-lg mr-2" />
                                    Reset Code
                                </button>
                            )}
                        </div>
                        <div className="w-full justify-center items-start flex max-h-[70vh] overflow-auto">
                            <CodeEditor code={code} setCode={setCode} />
                        </div>

                        <button
                            className={`mt-4 p-2 text-white rounded-lg font-bold flex justify-center items-center 
                                ${
                                    loading
                                        ? "bg-[#111828] cursor-not-allowed"
                                        : "bg-radial from-purple-600 to-purple-700 hover:bg-purple-900 cursor-pointer"
                                }
                              `}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loading />
                                    Processing...
                                </>
                            ) : (
                                "Submit Code"
                            )}
                        </button>
                    </div>
                    <div className="w-2/5 h-full flex flex-col justify-start items-center">
                        <h1 className="text-3xl font-bold text-white mb-4 mt-4 text-start w-11/12">
                            Your Results
                        </h1>
                        <img
                            src={`data:image/png;base64,${imageResult}`}
                            className="w-11/12 rounded-2xl border-2 border-gray-700"
                            alt="Result"
                        ></img>
                        <div className="w-11/12 flex justify-center items-start flex-col mt-4">
                            {timeTaken === 0 && (
                                <p className="text-xl">
                                    Submit your code to see the results!
                                </p>
                            )}
                            <div className="flex w-full mt-4 justify-start items-center">
                                {timeTaken > 0 && (
                                    <p className="text-xl w-full">
                                        Time taken:{" "}
                                        <span className="text-purple-400 font-bold">
                                            {timeTaken}
                                        </span>{" "}
                                        seconds
                                    </p>
                                )}
                                {bestTime > 0 && (
                                    <p className="text-xl w-full ">
                                        Best time:{" "}
                                        <span className="text-purple-400 font-bold">
                                            {bestTime}
                                        </span>{" "}
                                        seconds
                                    </p>
                                )}
                            </div>

                            {output && (
                                <p className="text-xl w-full mt-4">Output: </p>
                            )}
                            {output && (
                                <div className="w-full h-fit max-h-64 overflow-auto flex justify-center items-start bg-[#111829] rounded-lg mt-4 mb-4">
                                    <pre className="text-gray-200 font-mono w-full h-full p-4">
                                        <code>{output}</code>
                                    </pre>
                                </div>
                            )}

                            {codeError && (
                                <p className="text-red-500 font-bold mt-4">
                                    Error: {codeError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Submit;
