import "./App.css";
import React, { useState, useEffect } from "react";
import CourseCard from "./components/card";
import { Course, Card } from "./interfaces";
import Calendar from "./components/calendar";

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
      console.log(data);
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

async function fetchInterested(
  meta: Meta,
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
) {
  try {
    let cards = Array<Card>();
    const data = await api<Array<Course>>("/api/interested");
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
        const content = (
          <CourseCard
            courseName={`${course.number}(${course.credit})`}
            details={`${course.name}`}
            color={"blue"}
            span={span}
          ></CourseCard>
        );
        cards.push({
          row: row,
          col: col,
          span: span,
          content: content,
          id: course.number,
        });
      });
    });
    setCards(cards);
  } catch (error) {
    console.error("Failed fetching interested courses:", error);
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

  useEffect(() => {
    fetchMeta(setMeta);
    fetchInterested(meta, setCards);
    fetchCourses(setCourses);
  }, []);

  return (
    <>
      <div className="introduction">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate
        voluptates provident qui. Blanditiis recusandae nulla soluta at esse
        ipsam atque magni, ad quisquam perferendis harum voluptatem, ratione
        labore nobis ipsum vero. Distinctio recusandae minus iure
      </div>
      <div className="left-sidebar">
        <div className="course-selection">
          {courses.map((course) => {
            const foundCard = cards.find((card) => card.id === course.number);
            if (foundCard) {
              return (
                <button
                  value={course.number}
                  style={{
                    backgroundColor: `var(--card-color-green)`,
                  }}
                >
                  {course.number}
                </button>
              );
            }
            return <button value={course.number}>{course.number}</button>;
          })}
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
