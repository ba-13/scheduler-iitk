from flask import Flask, request, send_from_directory
from flask_cors import CORS
from allocater import Allocater
from threading import RLock

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

alc = Allocater("./all_courses.json")
alc_lock = RLock()
dist_path = "./dist"


@app.route("/api/courses")
def courses_route():
    courses = []
    for _, course in alc.courses.items():
        courses.append(course)
    return courses


@app.route("/api/current-interested")
def interested_route():
    courses = []
    for course in alc.interested:
        courses.append(alc.courses[course])
    return courses


@app.route("/api/meta")
def meta_route():
    return {
        "days": 5,
        "startTime": alc.interested_start_hour,
        "endTime": alc.interested_end_hour,
    }


@app.route("/api/not-interested", methods=["POST"])
def notInterestedButtonRoute():
    data = request.json
    button_value = data["value"]
    print("Received button value:", button_value)
    with alc_lock:
        alc.remove_interested_courses(button_value)
    return f"Removed {button_value}"


@app.route("/api/interested", methods=["POST"])
def interestedButtonRoute():
    data = request.json
    button_value = data["value"]
    print("Received button value:", button_value)
    with alc_lock:
        alc.add_interested_courses(button_value)
    return f"Removed {button_value}"


@app.route("/api/next-interested")
def nextInterestRoute():
    with alc_lock:
        result = alc.generate_compatible_courses_given_interested()
    return result


@app.route("/")
def serve_html():
    return send_from_directory(dist_path, "index.html")


# Route to serve static files (CSS, JS, etc.)
@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(dist_path, filename)


if __name__ == "__main__":
    app.run(debug=True, port=3000, host="0.0.0.0")
