import api from "./index";
import { toast } from "react-toastify";

const submitCode = async (teamID, code) => {
    try {
        const response = await api.post("submit", { teamID, code });
        if (response?.status === "success") {
            toast.success(response.message);
        }
        return response;
    } catch (error) {
        console.log(error);
    }
};

export { submitCode };
