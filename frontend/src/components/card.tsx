import React from "react";
import "./card.css";

export interface CourseCardProps {
  courseName: string;
  details: string;
  color: string;
  span: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  courseName,
  details,
  color,
  span = 4,
}) => {
  return (
    <div
      title={details}
      className="course-card"
      style={{
        backgroundColor: color,
        height: `calc(18px * ${span})`,
        lineHeight: `calc(18px * ${span})`,
      }}
    >
      <div>{courseName}</div>
    </div>
  );
};

export default CourseCard;
