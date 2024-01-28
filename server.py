from flask import Flask
import pandas as pd
import re
from flask_cors import CORS
from allocater import Allocater

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

alc = Allocater("./courses.json")
alc.add_interested_courses(["EE320A", "EE330A", "EE370A", "EE380A", "EE390A"])
is_feasible, clash1, clash2 = alc.check_feasible()


@app.route("/courses")
def courses_route():
    courses = []
    for _, course in alc.courses.items():
        courses.append(course)
    return courses


@app.route("/interested")
def interested_route():
    courses = []
    for course in alc.interested:
        courses.append(alc.courses[course])
    return courses


@app.route("/meta")
def meta_route():
    return {
        "days": 5,
        "startTime": alc.interested_start_hour,
        "endTime": alc.interested_end_hour,
    }


if __name__ == "__main__":
    app.run(debug=True, port=3000)
