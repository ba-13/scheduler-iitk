import "./App.css";
import React, { useState, useEffect } from "react";
import { Course, Card } from "./interfaces";
import Calendar from "./components/calendar";
import CourseDropDown from "./components/dropdown";

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

function api<T>(url: string): Promise<T> {
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
    const data = await api<ServerMeta>("/api/meta");
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
    const data = await api<Array<Course>>("/api/courses");
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
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
) {
  try {
    let cards = Array<Card>();
    const data = await api<Array<Course>>("/api/current-interested");
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
        cards.push({
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
    setCards(cards);
  } catch (error) {
    console.error("Failed fetching interested courses:", error);
  }
}

async function fetchNextInterest(
  setNextInterest: React.Dispatch<React.SetStateAction<string[]>>
) {
  try {
    const data = await api<Array<string>>("/api/next-interested");
    setNextInterest(data);
  } catch (error) {
    console.error("Failed to fetch next course data:", error);
  }
}

const App: React.FC = () => {
  const [meta, setMeta] = useState<Meta>({
    numCols: 3,
    startTime: 420,
    numRows: 53,
  });
  let [cards, setCards] = useState<Array<Card>>([]);
  let [courses, setCourses] = useState<Array<Course>>([]);
  let [nextInterest, setNextInterest] = useState<Array<string>>([]);

  const handleClick = async (value: string, api: string) => {
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
    fetchCurrentInterested(meta, setCards);
    fetchNextInterest(setNextInterest);
  };

  useEffect(() => {
    fetchMeta(setMeta);
    fetchCurrentInterested(meta, setCards);
    fetchCourses(setCourses);
    fetchNextInterest(setNextInterest);
  }, []);

  return (
    <>
      <div className="introduction">
        This is useful to check clashes between the courses that you want to opt
        for! Add courses from "Select Course" dropdown, while removing them by
        clicking their buttons. The dropdown would intelligently include only
        those courses which don't clash with those already present.
      </div>
      <div className="left-sidebar">
        <div className="course-selection">
          <div className="select-valid-courses">
            <CourseDropDown
              interests={nextInterest}
              handleClick={handleClick}
            ></CourseDropDown>
          </div>
          <div className="course-selection-title">Added Courses</div>
          <div>
            {courses.map((course) => {
              const foundCard = cards.find((card) => card.id === course.number);
              if (foundCard) {
                return (
                  <button
                    key={course.number}
                    onClick={() =>
                      handleClick(course.number, "/api/not-interested")
                    }
                  >
                    {course.number}
                  </button>
                );
              }
            })}
          </div>
        </div>
        <div className="calendar-container">
          <Calendar
            numRows={meta.numRows}
            numCols={meta.numCols}
            cards={cards}
            startTime={meta.startTime}
          ></Calendar>
        </div>
      </div>
    </>
  );
};

export default App;
