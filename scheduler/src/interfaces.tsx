export interface Card {
  row: number;
  col: number;
  content: React.ReactNode;
  span: number;
  id: string;
}

export interface Course {
  number: string;
  name: string;
  credit: number;
  types: Array<string>;
  professors: Array<string>;
  timetable: Array<Array<number>>;
}
