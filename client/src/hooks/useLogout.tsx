import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { logout } from "@/redux/slice/authSlice";
import storage from "redux-persist/lib/storage";
import { USER_API_ENDPOINT } from "@/utils/constant";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUserLogout = async () => {
    try {
      const res = await axios.get(`${USER_API_ENDPOINT}/logout`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        await storage.removeItem("persist:root");
        dispatch(logout());
        localStorage.clear();
        sessionStorage.clear();

        toast.success(res.data.message);
        navigate("/");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "An unexpected error occurred"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("LOGOUT Fn Error:", error);
    }
  };

  return handleUserLogout;
};
