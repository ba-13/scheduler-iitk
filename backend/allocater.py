import time
from dataclasses import dataclass, asdict
import json
import logging

# Configure the logger
logging.basicConfig(
    format="%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d - %(funcName)s] - %(message)s",
    level=logging.WARNING,
)

# Create a logger instance
logger = logging.getLogger(__name__)


@dataclass
class Course:
    number: str
    name: str
    credit: int
    types: "list[str]"
    professors: "list[str]"
    timetable: "list[tuple[int, int]]"
    department: str
    id: int

    @classmethod
    def from_dict(cls, dictionary):
        return cls(**dictionary)

    def to_dict(self):
        return asdict(self)

    def __repr__(self) -> str:
        return self.number


class Allocater:
    DAYS_TO_INDEX = {"M": 0, "T": 1, "W": 2, "Th": 3, "F": 4}
    INDEX_TO_DAYS = {0: "M", 1: "T", 2: "W", 3: "Th", 4: "F"}
    NULL_STRING = "NA"

    def __init__(self, json_path, init_courses: list = []) -> None:
        self.courses: "dict[str, Course]" = {}
        self.courses_list: list[str] = []
        self.courses_set: set[str] = set()  # contains course_number
        self.course_to_idx: dict[str, int] = {}
        self.courses_departmentwise: dict[str, set[str]] = {}
        self.interested: set[str] = set()  # contains course_number
        self.timings = None
        self.credits_considered_: int = 0
        # used when generating for all possible schedules given interested
        self.all_possible: list[str] = []
        self.departments: set[str] = set()
        self.minimum_credits = 27
        self.maximum_credits = 65

        with open(json_path, "r") as f:
            parsed_json: "list[dict]" = json.load(f)

        for idx, course in enumerate(parsed_json):
            for i, timing in enumerate(course["timetable"]):
                course["timetable"][i] = self.readable_time_to_mins(timing)
            course: Course = Course.from_dict(course)
            self.departments.add(course.department)
            self.courses[course.number] = course
            self.courses_list.append(course.number)
            self.courses_set.add(course.number)
            self.course_to_idx[course.number] = idx
            if course.department not in self.courses_departmentwise.keys():
                self.courses_departmentwise[course.department] = set([course.number])
            else:
                self.courses_departmentwise[course.department].add(course.number)
        del parsed_json
        self.add_interested_courses(init_courses)
        self.interested_start_hour = 7
        self.interested_end_hour = 21
        logger.info(self.courses_list)

    def add_interested_courses(self, interested_courses: list):
        for course in interested_courses:
            if course in self.courses_set:
                self.interested.add(course)
            else:
                logger.info(f"Found no course {course} present in universe")

    def remove_interested_courses(self, not_interested_courses: list):
        for course in not_interested_courses:
            if course in self.interested:
                self.interested.remove(course)
            else:
                logger.info(f"Found no course {course} present in interested")

    def readable_time_to_mins(self, time_string: str):
        """Convert string to integral hours from Monday 00:00

        Args:
            time_string (str): format 'T 09:00-10:00'

        Returns:
            tuple[int, int]: start, end
        """
        time_string = time_string.split(" ")
        if len(time_string) != 2:
            assert f"Time string of wrong format: {time_string}"
        day, duration = time_string[0], time_string[1]
        if day not in self.DAYS_TO_INDEX.keys():
            assert f"Unknown day in time string: {day}"
        day = self.DAYS_TO_INDEX[day]
        duration = duration.split("-")
        if len(duration) != 2:
            assert f"Duration of wrong format: {duration}"
        start, end = duration[0], duration[1]
        start = time.strptime(start, "%H:%M")
        end = time.strptime(end, "%H:%M")
        start_minutes = start.tm_hour * 60 + start.tm_min
        end_minutes = end.tm_hour * 60 + end.tm_min
        return (day * 24 * 60 + start_minutes, day * 24 * 60 + end_minutes)

    def mins_to_readable_time(self, mins: int):
        hours = mins // 60
        num_days = hours // 24
        hours = hours % 24
        mins = mins % 60
        hours = str(hours).zfill(2)
        mins = str(mins).zfill(2)
        time_str = hours + ":" + mins
        return self.INDEX_TO_DAYS[num_days], time_str

    def timing_to_start_end_idx_(self, timing: "tuple[int, int]"):
        start, end = timing
        start_idx = start // 15
        end_idx = end // 15
        # include start time rounded to the nearest 15min interval
        # dont include the end time
        # include all steps in between
        remainder = end % 15
        if remainder != 0:
            end_idx += 1
        return start_idx, end_idx

    def add_to_timings_(self, course_number: str):
        course_idx = self.course_to_idx[course_number]
        timetable = self.courses[course_number].timetable
        logger.info(f"Considered timings of {course_number}")
        for timing in timetable:
            start_idx, end_idx = self.timing_to_start_end_idx_(timing)
            for idx in range(start_idx, end_idx):
                if self.timings[idx] != -1 and self.timings[idx] != course_idx:
                    clashing_idx = self.timings[idx]
                    clashing_number = self.courses_list[clashing_idx]
                    self.timings[idx] = -2
                    logger.debug(
                        f"found clash at {self.mins_to_readable_time(idx * 15)} by {course_number} and {clashing_number}"
                    )
                    return (False, course_number, clashing_number)

        self.credits_considered_ += self.courses[course_number].credit
        for timing in timetable:
            start_idx, end_idx = self.timing_to_start_end_idx_(timing)
            for idx in range(start_idx, end_idx):
                self.timings[idx] = course_idx
        return (True, self.NULL_STRING, self.NULL_STRING)

    def remove_from_timings_(self, course_number: str):
        timetable = self.courses[course_number].timetable
        logger.info(f"Removed timings of {course_number}")
        self.credits_considered_ -= self.courses[course_number].credit
        for timing in timetable:
            start_idx, end_idx = self.timing_to_start_end_idx_(timing)
            for idx in range(start_idx, end_idx):
                self.timings[idx] = -1

    def check_feasible(self):
        """Checks the list of interested courses if they are clashing or not
        checks all courses if no interested list provided
        creates a timings list in process

        Returns:
            bool: is feasible
            str: course1 collision
            str: course2 collision
        """
        if len(self.interested) == 0:
            logger.error("Found no interested courses, add to check. returning")
        self.timings = [-1 for _ in range(len(self.DAYS_TO_INDEX) * 24 * 4)]
        self.credits_considered_ = 0
        for course_number in self.interested:
            # if course_number in self.timings_considered_:
            #     continue
            success, current_course, clashing_course = self.add_to_timings_(
                course_number
            )
            if not success:
                return (success, current_course, clashing_course)

        return True, self.NULL_STRING, self.NULL_STRING

    def generate_all_possible__(self, extra_courses: list, current_idx: int):
        """Fills up self.all_possible with possible schedules, given interested

        Args:
            extra_courses (list): _description_
            current_idx (int): _description_
        """
        # base case
        if current_idx >= len(extra_courses):
            return

        new_interest = [extra_courses[current_idx]]
        self.add_interested_courses(new_interest)
        feasible, c1, c2 = self.check_feasible()
        if feasible:
            if (
                self.credits_considered_ >= self.minimum_credits
                and self.credits_considered_ <= self.maximum_credits
            ):
                self.all_possible.append(self.interested.copy())
            self.generate_all_possible__(extra_courses, current_idx + 1)
        self.remove_interested_courses([extra_courses[current_idx]])
        self.generate_all_possible__(extra_courses, current_idx + 1)

    def generate_all_possible_given_interested(self):
        del self.all_possible
        self.all_possible = []
        extra_courses = sorted(list(self.courses_set.difference(self.interested)))
        self.generate_all_possible__(extra_courses, 0)
        return self.all_possible

    def generate_compatible_courses_given_interested(self):
        del self.all_possible
        self.all_possible = []
        extra_courses = sorted(list(self.courses_set.difference(self.interested)))
        for course_number in extra_courses:
            self.add_interested_courses([course_number])
            feasible, _, _ = self.check_feasible()
            if feasible:
                self.all_possible.append(course_number)
            self.remove_interested_courses([course_number])
        return self.all_possible

    def generate_department_courses_given_interested(self, curr_department):
        del self.all_possible
        self.all_possible = []
        if curr_department not in self.departments:
            logger.warning(
                f"Changed invalid department from {curr_department} to {self.departments[0]}"
            )
            curr_department = self.departments[0]
        extra_courses = sorted(
            list(
                self.courses_departmentwise[curr_department].difference(self.interested)
            )
        )
        for course_number in extra_courses:
            self.add_interested_courses([course_number])
            feasible, _, _ = self.check_feasible()
            if feasible:
                self.all_possible.append(course_number)
            self.remove_interested_courses([course_number])
        return self.all_possible
