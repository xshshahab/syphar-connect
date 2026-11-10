import axios from "axios";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFetchAllCompany } from "@/redux/slice/companySlice";
import { COMPANY_API_ENDPOINT } from "@/utils/constant";
import type { RootState } from "@/redux/store";

export const useDeleteCompanyById = () => {
  const dispatch = useDispatch();

  const allCompany = useSelector(
    (state: RootState) => state.company.allCompany
  );

  const deleteCompanyById = useCallback(
    async (companyId: string) => {
      try {
        const res = await axios.delete(
          `${COMPANY_API_ENDPOINT}/company/delete/${companyId}`,
          { withCredentials: true }
        );

        if (res.data.success) {
          const updatedCompanies = allCompany
            ? allCompany.filter((c) => c._id !== companyId)
            : [];

          dispatch(setFetchAllCompany(updatedCompanies));
        }
      } catch (error) {
        console.error("ERROR deleting company by id: ", error);
      }
    },
    [dispatch, allCompany]
  );

  return deleteCompanyById;
};
