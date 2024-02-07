import React from "react";
import "./dropdown.css"
import { CURRENT_INTERESTED_DEPARTMENT_API } from "../App";

interface DepartmentDropDownProps {
    departments: Array<string>;
    handleClick: (value: Array<string>, api: string) => void;
}

const DepartmentDropDown: React.FC<DepartmentDropDownProps> = ({
    departments,
    handleClick
}) => {
    return (
        <select name="select-departments">
            <option key="null">Select Department</option>
            {
                departments.map((department) => {
                    return (
                        <option key={department}
                            onClick={() => handleClick([department], CURRENT_INTERESTED_DEPARTMENT_API)}>
                            {department}
                        </option>
                    )
                })
            }
        </select>
    )
}

export default DepartmentDropDown