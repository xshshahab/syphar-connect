import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { setAllUsers } from "@/redux/slice/authSlice";

export const useGetAllUsers = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const getAllUsers = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${USER_API_ENDPOINT}/fetch-all-users`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAllUsers(res.data.users));
      }
    } catch (error) {
      console.error("ERROR! fetch get all users: ", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [user?._id]);
};
