import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import { setSearchQuery } from "@/redux/slice/jobSlice";

const filterData = [
  {
    filterType: "Location",
    array: ["Delhi NCR", "Mumbai", "Banglore", "Hyderabad", "Pune"],
  },
  {
    filterType: "Industry",
    array: [
      "Frontend Developer",
      "Backend Developer",
      "FullStack Developer",
      "Data Science",
    ],
  },
  {
    filterType: "Salary",
    array: ["0-40K", "42K-1lakh", "1lakh to 5lakh", "5lakh to 25Lakh"],
  },
];

const FilterPage: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const dispatch = useDispatch();

  const changeHandlerFn = (value: string) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    dispatch(setSearchQuery(selectedValue));
  }, [selectedValue]);

  return (
    <Card className="w-full p-4 border rounded-xl">
      <h2 className="text-xl font-bold mb-4">Filter Jobs</h2>
      <div className="space-y-6">
        {filterData.map((data, index) => (
          <div key={index} className="space-y-3">
            <h3 className="font-semibold dark:text-gray-200 text-gray-800">
              {data.filterType}
            </h3>

            <RadioGroup value={selectedValue} onValueChange={changeHandlerFn}>
              {data.array.map((option, idx) => {
                const id = `${data.filterType}-${idx}`;
                return (
                  <div key={id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={id} />
                    <Label htmlFor={id} className="text-sm">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FilterPage;
