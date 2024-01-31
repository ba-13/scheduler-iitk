export interface Card {
  row: number;
  col: number;
  courseTitle: string;
  courseDetails: string;
  color: string;
  span: number;
  id: string;
  rest: Course;
}

export interface Course {
  number: string;
  name: string;
  credit: number;
  types: Array<string>;
  professors: Array<string>;
  timetable: Array<Array<number>>;
  id: number;
  department: string;
}
