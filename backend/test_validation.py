"""
Comprehensive Validation & Security Tests for Student Performance Prediction System.
"""

import json
import sys
import os

# Include backend directory in python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
from app import app

client = app.test_client()

valid_base = {
    "study_hours": 6,
    "attendance": 85,
    "previous_score": 75,
    "assignment_score": 80,
    "sleep_hours": 7,
}

test_cases = [
    # (name, override_dict, expected_status, expected_error_substring)
    ("Valid baseline", {}, 200, None),
    ("Boundary study_hours=1 (min)", {"study_hours": 1}, 200, None),
    ("Boundary study_hours=24 (max)", {"study_hours": 24}, 200, None),
    ("Boundary attendance=0 (min)", {"attendance": 0}, 200, None),
    ("Boundary attendance=100 (max)", {"attendance": 100}, 200, None),
    ("Boundary previous_score=0 (min)", {"previous_score": 0}, 200, None),
    ("Boundary previous_score=100 (max)", {"previous_score": 100}, 200, None),
    ("Boundary assignment_score=0 (min)", {"assignment_score": 0}, 200, None),
    ("Boundary assignment_score=100 (max)", {"assignment_score": 100}, 200, None),
    ("Boundary sleep_hours=0 (min)", {"sleep_hours": 0}, 200, None),
    ("Boundary sleep_hours=24 (max)", {"sleep_hours": 24}, 200, None),
    # Study Hours: 1-24
    (
        "Study hours below min (0)",
        {"study_hours": 0},
        400,
        "Study Hours must be between 1 and 24",
    ),
    (
        "Study hours above max (25)",
        {"study_hours": 25},
        400,
        "Study Hours must be between 1 and 24",
    ),
    (
        "Study hours empty string",
        {"study_hours": ""},
        400,
        "Study Hours is required and cannot be empty",
    ),
    (
        "Study hours non-numeric string",
        {"study_hours": "six"},
        400,
        "Study Hours must be a valid numeric value",
    ),
    (
        "Study hours boolean True",
        {"study_hours": True},
        400,
        "Study Hours must be a valid number, not a boolean",
    ),
    # Attendance: 0-100
    (
        "Attendance below min (-1)",
        {"attendance": -1},
        400,
        "Attendance must be between 0 and 100",
    ),
    (
        "Attendance above max (101)",
        {"attendance": 101},
        400,
        "Attendance must be between 0 and 100",
    ),
    (
        "Attendance empty string",
        {"attendance": "  "},
        400,
        "Attendance is required and cannot be empty",
    ),
    # Previous score: 0-100
    (
        "Previous score below min (-10)",
        {"previous_score": -10},
        400,
        "Previous Exam Score must be between 0 and 100",
    ),
    (
        "Previous score above max (120)",
        {"previous_score": 120},
        400,
        "Previous Exam Score must be between 0 and 100",
    ),
    # Assignment score: 0-100
    (
        "Assignment score below min (-5)",
        {"assignment_score": -5},
        400,
        "Assignment Score must be between 0 and 100",
    ),
    (
        "Assignment score above max (150)",
        {"assignment_score": 150},
        400,
        "Assignment Score must be between 0 and 100",
    ),
    # Sleep hours: 0-24
    (
        "Sleep hours below min (-1)",
        {"sleep_hours": -1},
        400,
        "Sleep Hours must be between 0 and 24",
    ),
    (
        "Sleep hours above max (25)",
        {"sleep_hours": 25},
        400,
        "Sleep Hours must be between 0 and 24",
    ),
    # Malicious / edge attacks
    (
        "XSS string in study_hours",
        {"study_hours": "<script>alert(1)</script>"},
        400,
        "Study Hours must be a valid numeric value",
    ),
    (
        "SQL injection string in attendance",
        {"attendance": "1; DROP TABLE students;--"},
        400,
        "Attendance must be a valid numeric value",
    ),
    (
        "NaN string in previous_score",
        {"previous_score": "NaN"},
        400,
        "Previous Exam Score must be a finite numeric value",
    ),
    (
        "Infinity in assignment_score",
        {"assignment_score": "Infinity"},
        400,
        "Assignment Score must be a finite numeric value",
    ),
    (
        "Null value in sleep_hours",
        {"sleep_hours": None},
        400,
        "Sleep Hours is required and cannot be empty",
    ),
]


def run_tests():
    passed = 0
    for name, overrides, exp_status, exp_err in test_cases:
        payload = dict(valid_base)
        payload.update(overrides)
        res = client.post(
            "/predict", data=json.dumps(payload), content_type="application/json"
        )
        data = res.get_json() or {}

        assert (
            res.status_code == exp_status
        ), f"FAILED [{name}]: Expected {exp_status} but got {res.status_code}, data={data}"
        if exp_err:
            assert (
                exp_err in data.get("error", "")
            ), f"FAILED [{name}]: Expected error containing '{exp_err}', got: '{data.get('error')}'"
        passed += 1
        print(f" PASS: {name} -> HTTP {res.status_code}")

    # Test non-dict / malformed payloads
    res = client.post(
        "/predict", data=json.dumps([1, 2, 3]), content_type="application/json"
    )
    assert res.status_code == 400
    passed += 1
    print(" PASS: Array payload rejected -> HTTP 400")

    res = client.post(
        "/predict", data="raw invalid string", content_type="application/json"
    )
    assert res.status_code == 400
    passed += 1
    print(" PASS: Raw non-JSON payload rejected -> HTTP 400")

    print(f"\n=======================================================")
    print(f" SUCCESS: All {passed} validation test cases PASSED cleanly!")
    print(f"=======================================================\n")


if __name__ == "__main__":
    run_tests()
