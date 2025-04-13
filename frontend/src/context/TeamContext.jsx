import { createContext, useContext, useState } from "react";

const TeamContext = createContext();

export const useTeam = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
    const [teamName, setTeamName] = useState(
        localStorage.getItem("teamName") || null
    ); // null until set

    return (
        <TeamContext.Provider value={{ teamName, setTeamName }}>
            {children}
        </TeamContext.Provider>
    );
};
