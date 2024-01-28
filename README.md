# Scheduler IITK

This is a project meant to help students choose their courses in an easier fashion.

You would need to provide your department and current semester you're in.

The major constraints on choosing courses are:

- Chosen courses must not clash
- Courses should follow the default template by default
- If provided amount of credits, the template would try adjusting to the number of credits
- If you want course flexiblity (due to better grading or interests), you can provide the courses, and
the algorithm would provide choices based on those constraints

## TODO

- module that takes in a set of courses with their timings and the amount of credits needed, and returns those sets which are compatible with each other. this module should be able to take some predefined/inserted courses and adjust according to that. It would not consider which type of courses are there, aka neglect any department or type of course.

- create a UI that allows you to add or subtract interested courses, by providing from a pool. The pool should be served.
