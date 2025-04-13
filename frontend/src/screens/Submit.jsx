import React, { useState } from "react";
import Navigation from "../components/Navigation";
import CodeEditor from "../components/CodeEditor";

const Submit = () => {
    const initialCode = "def path_planning():\n    pass\n";
    const [code, setCode] = useState(
        localStorage.getItem("code") || initialCode
    );
    return (
        <>
            <Navigation
                screens={[
                    { url: "/", title: "Submit" },
                    { url: "/leaderboard", title: "Leaderboard" }
                ]}
            />
            <div className="flex flex-col items-center justify-center h-full w-full">
                <button
                    onClick={() => {
                        setCode(initialCode);
                        localStorage.setItem("code", initialCode);
                    }}
                >
                    Reset Code
                </button>
                <CodeEditor code={code} setCode={setCode} />
            </div>
        </>
    );
};

export default Submit;
