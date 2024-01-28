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
        backgroundColor: `var(--card-color-${color})`,
        height: `calc(26px * ${span})`,
        lineHeight: `calc(26px * ${span})`,
      }}
    >
      <div>{courseName}</div>
    </div>
  );
};

export default CourseCard;
