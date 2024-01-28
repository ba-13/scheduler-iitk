from allocater import Allocater


if __name__ == "__main__":
    alc = Allocater("./courses.json")
    alc.add_interested_courses(["EE320A", "EE330A", "EE370A", "EE380A", "EE390A"])
    is_feasible, clash1, clash2 = alc.check_feasible()
    if not is_feasible:
        print(
            is_feasible,
            alc.courses[clash1].number,
            alc.courses[clash2].number,
        )
        alc.print_timings()
        exit(1)
    all_possible = alc.generate_compatible_courses_given_interested()
    for possible in all_possible:
        print(possible)
