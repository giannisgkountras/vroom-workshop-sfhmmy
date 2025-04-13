import api from "./index";

const getLeaderboard = async () => {
    try {
        const response = await api.get("leaderboard");

        return response;
    } catch (error) {
        console.log(error);
    }
};

const getMyTeamsFastestTime = async (teamID) => {
    try {
        const response = await api.get(`leaderboard/${teamID}`);

        return response;
    } catch (error) {
        console.log(error);
    }
};
export { getLeaderboard, getMyTeamsFastestTime };
