import React from "react";
import "./dropdown.css";
import { CURRENT_INTERESTED_COURSES_API } from "../App";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";

interface CourseDropDownProps {
  interestedCourses: Array<string>;
  handleClick: (value: Array<string>, api: string) => void;
}

const CourseDropDown: React.FC<CourseDropDownProps> = ({
  interestedCourses,
  handleClick,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const courseNumber = event.target.value;
    handleClick([courseNumber], CURRENT_INTERESTED_COURSES_API);
  };

  return (
    <div className="select-valid">
      <FormControl className="form-select">
        <InputLabel>Select Course</InputLabel>
        <Select value={""} onChange={handleChange}>
          {interestedCourses.map((interestedCourse) => {
            return (
              <MenuItem value={interestedCourse} key={interestedCourse}>
                {interestedCourse}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default CourseDropDown;
