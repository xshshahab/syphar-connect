import { createSlice } from "@reduxjs/toolkit";

type SingleCompanyType = {
  _id: string;
  name: string;
  website: string;
  description: string;
  location: string;
  logo: string | null;
  createdAt: string;
};

interface CompanyState {
  singleCompany: SingleCompanyType | null;
  allCompany: SingleCompanyType[] | null;
}

const initialState: CompanyState = {
  singleCompany: null,
  allCompany: [],
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setSingleCompany: (state, action) => {
      state.singleCompany = action.payload;
    },
    setFetchAllCompany: (state, action) => {
      state.allCompany = action.payload;
    },
  },
});

export const { setSingleCompany, setFetchAllCompany } = companySlice.actions;

export const companyReducer = companySlice.reducer;
