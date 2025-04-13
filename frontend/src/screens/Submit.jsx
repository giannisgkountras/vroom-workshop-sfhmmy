import React, { useState } from "react";
import Navigation from "../components/Navigation";
import CodeEditor from "../components/CodeEditor";

const Submit = () => {
    const [code, setCode] = useState("def path_planning():\n    pass\n");
    return (
        <>
            <Navigation
                screens={[
                    { url: "/", title: "Submit" },
                    { url: "/leaderboard", title: "Leaderboard" }
                ]}
            />
            <div className="flex flex-col items-center justify-center h-full w-full">
                <CodeEditor initialData={code} setCode={setCode} />
            </div>
        </>
    );
};

export default Submit;
