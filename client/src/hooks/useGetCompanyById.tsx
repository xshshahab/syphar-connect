import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/slice/companySlice";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";

export const useGetCompanyById = (companyId: string) => {
  const dispatch = useDispatch();

  const fetchCompanyById = async () => {
    try {
      const res = await axios.get(
        `${COMPANY_API_ENDPOINT}/company/${companyId}`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setSingleCompany(res.data.company));
      }
    } catch (error) {
      console.error("ERROR! fetch company by id: ", error);
    }
  };

  useEffect(() => {
    fetchCompanyById();
  }, [companyId, dispatch]);
};
