import "./App.css";
import React, { useState, useEffect } from "react";
import { Course, CurrentCourse } from "./interfaces";
import Calendar from "./components/calendar";
import CourseDropDown from "./components/coursedropdown";
import DepartmentDropDown from "./components/departmentdropdown";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export const META_API = "/api/meta";
export const COURSES_API = "/api/courses";
export const CURRENT_INTERESTED_COURSES_API = "/api/courses/current"; // add GET and POST
export const NEXT_POSSIBLE_COURSES_API = "/api/courses/next";
export const DEPARTMENTS_API = "/api/departments";
export const REMOVE_INTEREST_COURSES_API = "/api/courses/remove";
export const CURRENT_INTERESTED_DEPARTMENT_API = "/api/departments/current";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

interface Meta {
  numCols: number;
  startTime: number;
  numRows: number;
}

interface ServerMeta {
  days: number;
  startTime: number;
  endTime: number;
}

function mins_decomposed(omins: number) {
  let mins = omins;
  const days = Math.floor(mins / (24 * 60));
  mins = mins - days * 24 * 60;
  const hours = Math.floor(mins / 60);
  mins = mins - hours * 60;

  return {
    days: days,
    hours: hours,
    mins: mins,
  };
}

export function api<T>(url: string): Promise<T> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      return data;
    });
}

async function fetchMeta(setMeta: React.Dispatch<React.SetStateAction<Meta>>) {
  try {
    const data = await api<ServerMeta>(META_API);
    let numCols = data.days + 1;
    let startTime = data.startTime * 60;
    let numRows = (data.endTime - data.startTime) * 4 + 1;
    const meta = {
      numCols: numCols,
      startTime: startTime,
      numRows: numRows,
    };
    setMeta(meta);
  } catch (error) {
    console.error("Failed to fetch meta data:", error);
  }
}

async function fetchCourses(
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
) {
  try {
    const data = await api<Array<Course>>(COURSES_API);
    setCourses(data);
  } catch (error) {
    console.error("Failed to fetch meta data:", error);
  }
}

const extractDigits = (str: string) => {
  const matches = str.match(/\d+/);
  return matches ? Number(matches[0]) : 449;
};

async function fetchCurrentInterested(
  meta: Meta,
  setCurrentCourses: React.Dispatch<React.SetStateAction<CurrentCourse[]>>
) {
  try {
    let currentCourses = Array<CurrentCourse>();
    const data = await api<Array<Course>>(CURRENT_INTERESTED_COURSES_API);
    data.forEach((course) => {
      course.timetable.forEach((timing) => {
        const {
          days: dayStart,
          hours: hourStart,
          mins: minStart,
        } = mins_decomposed(timing[0]);
        const { hours: hourEnd, mins: minEnd } = mins_decomposed(timing[1]);
        const { hours: hoursDiff, mins: minsDiff } = mins_decomposed(
          meta.startTime
        );
        const col = dayStart + 1;
        const startIdx =
          (hourStart - hoursDiff) * 4 + Math.floor((minStart - minsDiff) / 15);
        let endIdx =
          (hourEnd - hoursDiff) * 4 + Math.floor((minEnd - minsDiff) / 15);
        if (minEnd % 15 !== 0) endIdx += 1;
        const span = endIdx - startIdx;
        const row = startIdx + 1;
        const courseTitle = `${course.number}(${course.credit})`;
        const courseDetails = `${course.name}`;
        currentCourses.push({
          row: row,
          col: col,
          span: span,
          courseTitle: courseTitle,
          courseDetails: courseDetails,
          color: `#${(extractDigits(course.number) + 575).toString(16)}`,
          id: course.number,
          rest: course,
        });
      });
    });
    setCurrentCourses(currentCourses);
  } catch (error) {
    console.error("Failed fetching interested courses:", error);
  }
}

async function fetchNextInterest(
  setNextInterest: React.Dispatch<React.SetStateAction<string[]>>
) {
  try {
    const data = await api<Array<string>>(NEXT_POSSIBLE_COURSES_API);
    setNextInterest(data);
  } catch (error) {
    console.error("Failed to fetch next course data:", error);
  }
}

async function fetchDepartments(
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>
) {
  try {
    const data = await api<Array<string>>(DEPARTMENTS_API);
    setDepartments(data);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
  }
}

const App: React.FC = () => {
  const [meta, setMeta] = useState<Meta>({
    numCols: 4,
    startTime: 420,
    numRows: 53,
  });
  let [currentCourses, setCurrentCourses] = useState<Array<CurrentCourse>>([]);
  let [departments, setDepartments] = useState<Array<string>>([]);
  let [courses, setCourses] = useState<Array<Course>>([]);
  let [nextInterest, setNextInterest] = useState<Array<string>>([]);

  const handleClick = async (value: Array<string>, api: string) => {
    try {
      await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: value }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
    fetchCurrentInterested(meta, setCurrentCourses);
    fetchNextInterest(setNextInterest);
  };

  useEffect(() => {
    fetchMeta(setMeta);
    fetchCurrentInterested(meta, setCurrentCourses);
    fetchCourses(setCourses);
    fetchDepartments(setDepartments);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="introduction">
        This is useful to check clashes between the courses that you want to opt
        for! <br /> Add courses by first "Select Department" then "Select
        Course", while removing them by clicking their buttons. <br /> The
        dropdown would intelligently include only those courses which don't
        clash with those already present.
      </div>
      <div className="left-sidebar">
        <div className="course-selection">
          <div className="select-valid-courses">
            <DepartmentDropDown
              departments={departments}
              handleClick={handleClick}
            ></DepartmentDropDown>
            <CourseDropDown
              interestedCourses={nextInterest}
              handleClick={handleClick}
            ></CourseDropDown>
          </div>
          <div className="course-selection-title">Added Courses</div>
          <div>
            {courses.map((course) => {
              const foundCard = currentCourses.find(
                (card) => card.id === course.number
              );
              if (foundCard) {
                return (
                  <button
                    key={course.number}
                    title="Click to Remove"
                    onClick={() => {
                      handleClick([course.number], REMOVE_INTEREST_COURSES_API);
                      const idx = currentCourses.indexOf(foundCard);
                      currentCourses.splice(idx, 1);
                      setCurrentCourses(currentCourses);
                    }}
                  >
                    {course.number}
                  </button>
                );
              }
            })}
          </div>
          <div id="remove-button">
            <button
              onClick={() => {
                let courseList = currentCourses.map((card) => {
                  return card.id;
                });
                handleClick(courseList, REMOVE_INTEREST_COURSES_API);
              }}
            >
              Remove All Selected
            </button>
          </div>
          <div id="total-details">
            Total Credits:{"\t"}
            {courses.reduce((accCredits, course) => {
              const foundCard = currentCourses.find(
                (card) => card.id === course.number
              );
              if (foundCard) {
                return accCredits + course.credit;
              } else {
                return accCredits;
              }
            }, 0)}
          </div>
        </div>
        <div className="calendar-container">
          <Calendar
            numRows={meta.numRows}
            numCols={meta.numCols}
            currentCourses={currentCourses}
            startTime={meta.startTime}
          ></Calendar>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
