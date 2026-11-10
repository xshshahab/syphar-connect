import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFetchAllCompany } from "@/redux/slice/companySlice";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";

export const useGetAllCompany = () => {
  const dispatch = useDispatch();

  const getAllCompany = async () => {
    try {
      const res = await axios.get(`${COMPANY_API_ENDPOINT}/companies`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setFetchAllCompany(res.data.companies));
      }
    } catch (error) {
      console.error("ERROR! fetch get all company: ", error);
    }
  };

  useEffect(() => {
    getAllCompany();
  }, []);
};
