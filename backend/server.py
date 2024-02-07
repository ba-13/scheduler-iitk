from flask import Flask, request, send_from_directory, session
from allocater import Allocater
from threading import RLock

app = Flask(__name__)
# CORS(app)  # This will enable CORS for all routes

dist_path = "./dist"
app.secret_key = "your_secret_key"  # should change this
course_file = "./all_courses.json"


@app.route("/api/courses")
def courses_route():
    alc = Allocater(course_file, [])
    courses = []
    for _, course in alc.courses.items():
        courses.append(course)
    return courses


@app.route("/api/courses/current", methods=["GET"])
def interested_route():
    init_interested = session["interested"]
    courses = []
    alc = Allocater(course_file, init_interested)
    for course in init_interested:
        courses.append(alc.courses[course])
    return courses


@app.route("/api/courses/current", methods=["POST"])
def interestedButtonRoute():
    data = request.json
    button_value = data["value"]
    print("Received add course:", button_value)
    session["interested"].extend(button_value)
    session.modified = True
    return f"Added {button_value}"


@app.route("/api/meta")
def meta_route():
    alc = Allocater(course_file)
    return {
        "days": 5,
        "startTime": alc.interested_start_hour,
        "endTime": alc.interested_end_hour,
    }


@app.route("/api/courses/remove", methods=["POST"])
def notInterestedButtonRoute():
    data = request.json
    button_value = data["value"]
    print("Received remove course:", button_value)
    session["interested"] = list(
        filter(lambda a: a not in button_value, session["interested"])
    )
    session.modified = True
    return f"Removed {button_value}"


@app.route("/api/courses/next")
def nextInterestRoute():
    init_interested = session["interested"]
    alc = Allocater(course_file, init_interested)
    alc_lock = RLock()
    with alc_lock:
        if "department" not in session.keys():
            result = alc.generate_compatible_courses_given_interested()
        else:
            print("Department wise")
            result = alc.generate_department_courses_given_interested(
                session["department"]
            )
    return result


@app.route("/api/departments")
def allDepartmentsRoute():
    alc = Allocater(course_file)
    return list(alc.departments)


@app.route("/api/departments/current", methods=["POST"])
def changeInterestedDepartment():
    data = request.json
    button_value = data["value"]
    print("Received department:", button_value)
    if len(button_value) != 1:
        print(f"[ERR] Department sent is: {button_value}")
        return None
    else:
        session["department"] = button_value[0]
        session.modified = True
        return session["department"]


@app.route("/api/departments/current", methods=["GET"])
def showInterestedDepartment():
    if "department" not in session.keys():
        return None
    return session["department"]


@app.route("/")
def serve_html():
    if "interested" not in session.keys():
        session["interested"] = []
    return send_from_directory(dist_path, "index.html")


# Route to serve static files (CSS, JS, etc.)
@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(dist_path, filename)


if __name__ == "__main__":
    app.run(debug=False, port=3000, host="0.0.0.0")
