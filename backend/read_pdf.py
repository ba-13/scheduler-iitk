import PyPDF2
import re
import logging
import json
import argparse

parser = argparse.ArgumentParser("Parse PDF to JSON")
parser.add_argument(
    "--file", type=str, default="./course-schedule.pdf", help="path to course pdf file"
)
args = parser.parse_args()

logging.basicConfig(
    filename="./parse.log",
    filemode="w",
    format="[%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d] - %(message)s",
    level=logging.WARNING,
)

logger = logging.getLogger(__name__)

re_split_course_instructor = re.compile(r"\d+-\d+-\d+-\d+")
re_split_course_timing = re.compile(r"ac.in\s*\([IO]\),*\s+(?=[A-Z]|$)", re.DOTALL)
re_find_timings = re.compile(r"(.+?)(\d\d:\d\d)\s*-\s*(\d\d:\d\d)")
re_find_days = re.compile(r"(Th|M|T|W|F)")
re_find_course_details = re.compile(r"^(\d+)\s+([A-Z]+)\s+(.*?)\(([A-Z]+\d+[A-Z]*)\)")
re_split_professors = re.compile(r",\s+")
re_split_types = re.compile(r"([A-Za-z0-9]+)")


def remove_nested_parens(input_str):
    result = ""
    paren_level = 0
    for ch in input_str:
        if ch == "(":
            paren_level += 1
        elif (ch == ")") and paren_level:
            paren_level -= 1
        elif not paren_level:
            result += ch
    return result


def seperate_timetable(input_str: str):
    global err_count
    try:
        rest_time_split = re_split_course_timing.split(input_str)
        course, timing = rest_time_split[0], rest_time_split[1].strip()
        course += "iitk.ac.in"
    except IndexError as err:
        raise IndexError(f"Could not seperate timetable {rest_time_split}: {err}")
    timing_slots = re_find_timings.findall(timing)
    timings = []
    for t, s, e in timing_slots:
        t = remove_nested_parens(t)
        days = set(re_find_days.findall(t))
        for day in days:
            timings.append(f"{day} {s}-{e}")
    if len(timings) == 0:
        err_count -= 1
        raise ValueError(f"No timings found for {course}, skipping")
    return course, timings


def seperate_course_details(input_str: str):
    try:
        ci_split = re_split_course_instructor.split(input_str)
        course, instr = ci_split[0], ci_split[1]
    except IndexError as err:
        raise IndexError(f"Could not seperate course-instructor {input_str}: {err}")
    course_details = re_find_course_details.search(course).groups()
    assert len(course_details) == 4
    instr_split = re.split(r"\s\s+", instr)
    assert len(instr_split) >= 3
    credit = re.search(r"\((\d+)\)", instr_split[0]).groups()[0]
    credit = int(credit)
    return course_details, instr_split, credit


print("[PyPDF2] Running PDF Parser")

try:
    reader = PyPDF2.PdfReader(args.file)
except Exception as e:
    print("[PyPDF2] Error reading PDF!", e)
    exit(1)
len_pages = len(reader.pages)

entries = []
for page in reader.pages:
    entries.append(page.extract_text())
print("[PyPDF2]", entries[0][:60])

number_match = re.compile(r"\n(\d+\s[A-Z].+?(?=\n\d+\s[A-Z]|\Z))", re.DOTALL)
courses_raw = []
for entry in entries:
    courses_raw.extend(number_match.findall(entry))

if len(courses_raw) == 0:
    print("[PyPDF2] Didn't find courses inside PDF, exiting")
    exit(1)
json_arr = []
err_count = 0
for course_raw in courses_raw:
    course_raw = course_raw.replace("\n", "")
    try:
        course, timings = seperate_timetable(course_raw)
        course_details, instr_details, credit = seperate_course_details(course)
    except Exception as err:
        err_count += 1
        logger.error(f"{err}: Couldn't split {course_raw.strip()}")
        continue
    instr_details[-3] = remove_nested_parens(instr_details[-3])
    instr_details[-3] = re_split_types.findall(instr_details[-3])
    final_json = {
        "number": course_details[-1],
        "name": course_details[-2],
        "credit": credit,
        "types": instr_details[-3],
        "professors": re_split_professors.split(instr_details[-2]),
        "timetable": timings,
        "department": course_details[1],
        "id": int(course_details[0]),
    }
    json_arr.append(final_json)

# print(json_arr)
print(f"[PyPDF2] Parsed {len(json_arr)} courses, can't parse {err_count} courses")
with open("all_courses.json", "w") as f:
    json.dump(json_arr, f)
