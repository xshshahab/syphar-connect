import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { USER_API_ENDPOINT } from "@/utils/constant";
import { setAllUsers } from "@/redux/slice/authSlice";

export const useGetAllUsers = () => {
  const dispatch = useDispatch();

  const getAllUsers = async () => {
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
  }, []);
};
