import React from "react";
import "./calendar.css";
import { CurrentCourse } from "../interfaces";
import CourseCard from "./card";

interface CalendarProps {
  numRows: number;
  numCols: number;
  currentCourses: CurrentCourse[];
  startTime: number;
}

function mins_to_readable_time(mins: number) {
  const hours = Math.floor(mins / 60);
  const extra_mins = mins % 60;
  const formattedTime = `${hours < 10 ? "0" + hours : hours}:${
    extra_mins < 10 ? "0" + extra_mins : extra_mins
  }`;
  return formattedTime;
}

const Calendar: React.FC<CalendarProps> = ({
  numRows,
  numCols,
  currentCourses,
  startTime,
}) => {
  const days = ["M", "T", "W", "Th", "F"];
  const rows = Array.from({ length: numRows }, (_, rowIndex) => (
    <tr key={rowIndex}>
      {Array.from({ length: numCols }, (_, colIndex) => {
        const card = currentCourses.find(
          (c) => c.row === rowIndex && c.col === colIndex
        );
        if (colIndex == 0 && rowIndex == 0) {
          return (
            <td key={colIndex} className="card-cell">
              Time\Day
            </td>
          );
        }
        if (colIndex == 0) {
          return (
            <td key={colIndex} className="time-cell">
              {mins_to_readable_time(startTime + (rowIndex - 1) * 15)}
            </td>
          );
        } else if (rowIndex == 0) {
          return (
            <td key={colIndex} className="day-cell">
              {days[colIndex - 1]}
            </td>
          );
        }
        if (card) {
          return (
            <td key={colIndex} className="card-cell">
              <CourseCard
                courseName={card.courseTitle}
                details={card.courseDetails}
                color={card.color}
                span={card.span}
              ></CourseCard>
            </td>
          );
        } else {
          return <td key={colIndex}></td>;
        }
      })}
    </tr>
  ));

  return (
    <table className="calendar">
      <tbody>{rows}</tbody>
    </table>
  );
};

export default Calendar;
