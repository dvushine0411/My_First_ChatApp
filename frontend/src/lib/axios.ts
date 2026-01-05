import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // important for cookies
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 || error.response?.status === 403 && !originalRequest._retry) {

            if (originalRequest.url.includes("/auth/refresh")) {
                  // Refresh token cũng hết hạn nốt -> Logout luôn
                  useAuthStore.getState().signOut(); // Hoặc hàm clear user
                  window.location.href = "/signin";  // Đá về trang login
                  return Promise.reject(error);
            }
            originalRequest._retry = true;
            try {
                // Call refresh token endpoint (which sets new cookie and returns new accessToken if implemented that way, 
                // but based on AuthController.js: refreshToken returns {accessToken})
                const response = await axiosInstance.post("/auth/refresh");
                const { accessToken } = response.data;  
                
                if (accessToken) {
                    useAuthStore.getState().setAccessToken(accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                useAuthStore.getState().signOut();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;