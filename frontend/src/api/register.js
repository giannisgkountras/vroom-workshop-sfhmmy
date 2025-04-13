import api from "./index";
import { toast } from "react-toastify";

const registerCall = async (teamName) => {
    try {
        const response = await api.post("register", { teamName });
        if (response?.status === "success") {
            toast.success(response.message);
        }
        return response;
    } catch (error) {
        console.log(error);
    }
};

const joinCall = async (teamName) => {
    try {
        const response = await api.post("join", { teamName });

        if (response?.status === "success") {
            toast.success(response.message);
        }

        return response;
    } catch (error) {
        console.log(error);
    }
};

export { registerCall, joinCall };
