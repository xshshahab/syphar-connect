import axios from "axios";
import { toast } from "sonner";
import store from "@/redux/store";
import { logout } from "@/redux/slice/authSlice";

// If the server says the session is no longer valid (expired or removed cookie)
// while the app still thinks someone is logged in, sign them out and send
// them to the login screen instead of leaving a half-working page.
export const setupAuthGuard = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (store.getState().auth.user) {
          store.dispatch(logout());
          toast.error("Your session has expired. Please log in again.");
          window.location.assign("/auth/login");
        }
      }
      return Promise.reject(error);
    }
  );
};
