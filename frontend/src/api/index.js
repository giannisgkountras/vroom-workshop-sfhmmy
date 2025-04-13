import ky from "ky";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const rootApi = ky.extend({
    timeout: false,
    prefixUrl: `${apiUrl}`,
    headers: {
        "X-API-Key": apiKey
    }
});
const api = {
    post: async (path, json) => {
        try {
            return await rootApi.post(path, { json }).json();
        } catch (error) {
            // Extract and parse the error JSON response
            if (error.response) {
                const errorData = await error.response.json();
                toast.error(
                    errorData.message || "An unexpected error occurred"
                );
                return { status: "error", message: errorData.message };
            } else {
                toast.error(error.message || "An unexpected error occurred");
                return { status: "error", message: error.message };
            }
        }
    },
    get: async (path) => {
        try {
            return await rootApi.get(path).json();
        } catch (error) {
            toast.error(error.message);
        }
    }
};

export default api;
