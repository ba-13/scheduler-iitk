import unittest
from allocater import Allocater


class TestSum(unittest.TestCase):
    alc = Allocater("./courses.json")

    def test_timing_function(self):
        time_str = "M 00:00-01:00"
        start, end = self.alc.readable_time_to_mins(time_str)
        self.assertEqual(start, 0, "Should be 0")
        self.assertEqual(end, 60, "Should be 60")

    def test_sum_tuple(self):
        time_str = "F 15:41-16:27"
        start, end = self.alc.readable_time_to_mins(time_str)
        day, time1_only = self.alc.mins_to_readable_time(start)
        day, time2_only = self.alc.mins_to_readable_time(end)
        self.assertEqual(
            time_str, f"{day} {time1_only}-{time2_only}", "Functions are not inverses"
        )


if __name__ == "__main__":
    unittest.main()
