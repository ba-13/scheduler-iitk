# Academic-flexibility Scheduler IITK

This is a project meant to help IITK students choose their courses in an easier fashion.  
Find it at [scheduler-iitk.onrender.com](https://scheduler-iitk.onrender.com/)

Features of this application are:

- Chosen courses would not clash according to the timetable
- Adding new courses by choosing respective department then it's courses
- Option to update schedule by anyone

![preview](./assets/preview.png)

## Known Issues

- Currently I am ignoring that practical courses occupy multiple days a week even though may actually take up only one. Therefore any course that clashes with any of the practical slots will still be considered a clash.
- The codebase is not memory optimized, which leads to delays for every usage due to free hosting service used.

## Solved Issues

- During development, aka in React Strict Mode, every request within render happens twice, this leads to interference of the first request processing, due to effects similar to state machines, therefore use blocking locks
- Included session-management to make all users independent of each other, and have a session last for a user even after closing the request, as cookies.

## Future work

- The courses you select provides a prior to what kind of courses you would want to take up, which should be recommended first. Make the selection bar more intelligent.
- Provide more courses aggregates

## Routes

- `api/courses`: Get all courses
  - `api/courses/current`: Get currently chosen courses
  - `api/courses/next`
- `api/departments`: Get all departments
  - `api/departments`: Get currently active department
- `/api/refresh-pdf`: Update PDF

## References

- [Locking to prevent multiple simultaneous requests changing state](https://stackoverflow.com/questions/43999611/flask-suspend-other-requests-while-a-certain-one-is-being-handled)
- [Strict Mode React](https://stackoverflow.com/questions/68914256/react-request-to-api-trigger-two-times-the-then-block-the-request-is-sended-tw)
