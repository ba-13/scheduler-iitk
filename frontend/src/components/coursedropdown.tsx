import React from "react";
import "./dropdown.css";
import { CURRENT_INTERESTED_COURSES_API } from "../App";

interface CourseDropDownProps {
  interestedCourses: Array<string>;
  handleClick: (value: Array<string>, api: string) => void;
}

const CourseDropDown: React.FC<CourseDropDownProps> = ({
  interestedCourses,
  handleClick,
}) => {
  return (
    <select name="select-valid-courses" id="select-valid-courses">
      <option key="null">Select Course</option>
      {interestedCourses.map((interestedCourse) => {
        return (
          <option
            onClick={() => handleClick([interestedCourse], CURRENT_INTERESTED_COURSES_API)}
            key={interestedCourse}
          >
            {interestedCourse}
          </option>
        );
      })}
    </select>
  );
};

export default CourseDropDown;
