import React from "react";
import "./dropdown.css";
import { CURRENT_INTERESTED_DEPARTMENT_API } from "../App";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";
import { useState } from "react";

interface DepartmentDropDownProps {
  departments: Array<string>;
  handleClick: (value: Array<string>, api: string) => void;
}

// interface DepartmentAPI {
//   department: string;
// }

// async function fetchDepartment(
//   setCurrDepartment: React.Dispatch<React.SetStateAction<string>>
// ) {
//   try {
//     const data: DepartmentAPI = await api<DepartmentAPI>(
//       CURRENT_INTERESTED_DEPARTMENT_API
//     );

//     setCurrDepartment(data.department);
//   } catch (error) {
//     console.error("Failed to fetch next course data:", error);
//   }
// }

const DepartmentDropDown: React.FC<DepartmentDropDownProps> = ({
  departments,
  handleClick,
}) => {
  let [currDepartment, setCurrDepartment] = useState("");
  const handleChange = (event: SelectChangeEvent<string>) => {
    const department = event.target.value;
    handleClick([department], CURRENT_INTERESTED_DEPARTMENT_API);
    setCurrDepartment(department);
  };
  // useEffect(() => {
  // fetchDepartment(setCurrDepartment);
  // });

  return (
    <div className="select-valid">
      <FormControl className="form-select">
        <InputLabel>Select Department</InputLabel>
        <Select value={currDepartment} onChange={handleChange}>
          {departments.map((department) => {
            return (
              <MenuItem value={department} key={department}>
                {department}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default DepartmentDropDown;
