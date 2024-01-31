import React from "react";
import "./dropdown.css";

interface CourseDropDownProps {
  interests: Array<string>;
  handleClick: (value: Array<string>, api: string) => void;
}

const CourseDropDown: React.FC<CourseDropDownProps> = ({
  interests,
  handleClick,
}) => {
  return (
    <select name="select-valid-courses" id="select-valid-courses">
      <option key="null">Select Course</option>
      {interests.map((uniqueCard) => {
        return (
          <option
            onClick={() => handleClick([uniqueCard], "/api/interested")}
            key={uniqueCard}
          >
            {uniqueCard}
          </option>
        );
      })}
    </select>
  );
};

export default CourseDropDown;
