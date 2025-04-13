import api from "./index";
import { toast } from "react-toastify";

const registerCall = async (teamName, secretKey) => {
    try {
        const response = await api.post("register", { teamName, secretKey });
        if (response?.status === "error") {
            toast.error("Publish request failed:", response.message);
        }
        if (response?.status === "success") {
            toast.success(response.message);
        }
        return response;
    } catch (error) {
        toast.error(error.message);
        return { status: "error", message: error.message };
    }
};

export { registerCall };
