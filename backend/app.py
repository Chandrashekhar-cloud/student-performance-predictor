"""
Student Performance Prediction System - Flask API
Provides REST API endpoints for student performance prediction and service health check.
Includes comprehensive input validation to protect against invalid or malicious payloads.
"""

import os
import math
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for frontend integration
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variable to store loaded model
model = None

# Validation specification: rules for all required input fields
FIELD_VALIDATION_RULES = {
    "study_hours": {
        "label": "Study Hours",
        "aliases": ["study_hours", "studyHours"],
        "min": 1.0,
        "max": 24.0,
    },
    "attendance": {
        "label": "Attendance",
        "aliases": ["attendance"],
        "min": 0.0,
        "max": 100.0,
    },
    "previous_score": {
        "label": "Previous Exam Score",
        "aliases": ["previous_score", "previousExam", "previousScore"],
        "min": 0.0,
        "max": 100.0,
    },
    "assignment_score": {
        "label": "Assignment Score",
        "aliases": ["assignment_score", "assignmentScore"],
        "min": 0.0,
        "max": 100.0,
    },
    "sleep_hours": {
        "label": "Sleep Hours",
        "aliases": ["sleep_hours", "sleepHours"],
        "min": 0.0,
        "max": 24.0,
    },
}


def find_model_path():
    """Locate the trained model file across standard project directory layouts."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(base_dir, "..", "models", "student_performance_model.pkl"),
        os.path.join(base_dir, "models", "student_performance_model.pkl"),
        os.path.join("models", "student_performance_model.pkl"),
        os.path.join("..", "models", "student_performance_model.pkl"),
    ]
    for path in possible_paths:
        abs_path = os.path.abspath(path)
        if os.path.exists(abs_path):
            return abs_path
    return None


def load_trained_model():
    """Load the trained machine learning model into memory."""
    global model
    path = find_model_path()
    if path and os.path.exists(path):
        model = joblib.load(path)
        print(f"[*] Loaded trained model from: {path}")
    else:
        print("[!] Warning: Trained model file not found. Please run train_model.py first.")


# Load model immediately upon startup
load_trained_model()


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint to verify that the backend service is running."""
    model_status = "loaded" if model is not None else "not_loaded"
    return (
        jsonify(
            {
                "status": "healthy",
                "service": "student-performance-prediction-api",
                "model_status": model_status,
            }
        ),
        200,
    )


@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict student final performance score based on academic and behavioral factors.
    Validates all inputs rigorously against type, range, and format requirements.
    """
    global model
    if model is None:
        load_trained_model()
        if model is None:
            return (
                jsonify(
                    {
                        "error": "Trained model is not available on server. Please run train_model.py first."
                    }
                ),
                500,
            )

    # 1. Reject non-JSON requests
    data = request.get_json(silent=True)
    if data is None or not isinstance(data, dict):
        return (
            jsonify(
                {"error": "Invalid request payload. Expected a valid JSON object."}
            ),
            400,
        )

    validated_features = {}

    # 2. Iterate through validation rules and thoroughly check every input
    for canonical_name, rule in FIELD_VALIDATION_RULES.items():
        label = rule["label"]
        min_val = rule["min"]
        max_val = rule["max"]

        # Extract value using any valid alias (e.g. study_hours or studyHours)
        raw_val = None
        for alias in rule["aliases"]:
            if alias in data:
                raw_val = data[alias]
                break

        # Check for missing or empty value
        if raw_val is None or (isinstance(raw_val, str) and raw_val.strip() == ""):
            return (
                jsonify(
                    {"error": f"{label} is required and cannot be empty."}
                ),
                400,
            )

        # Reject boolean types (in Python, isinstance(True, int) evaluates to True)
        if isinstance(raw_val, bool):
            return (
                jsonify(
                    {"error": f"{label} must be a valid number, not a boolean."}
                ),
                400,
            )

        # Reject non-numeric types or infinite/NaN values
        try:
            numeric_val = float(raw_val)
            if math.isnan(numeric_val) or math.isinf(numeric_val):
                return (
                    jsonify(
                        {"error": f"{label} must be a finite numeric value."}
                    ),
                    400,
                )
        except (ValueError, TypeError):
            return (
                jsonify(
                    {"error": f"{label} must be a valid numeric value."}
                ),
                400,
            )

        # Check numeric range
        if numeric_val < min_val or numeric_val > max_val:
            # Format integer boundaries cleanly (e.g. 1 instead of 1.0)
            fmt_min = int(min_val) if min_val.is_integer() else min_val
            fmt_max = int(max_val) if max_val.is_integer() else max_val
            return (
                jsonify(
                    {"error": f"{label} must be between {fmt_min} and {fmt_max}."}
                ),
                400,
            )

        validated_features[canonical_name] = numeric_val

    # 3. Prepare DataFrame for model inference
    input_df = pd.DataFrame([validated_features])

    try:
        raw_prediction = float(model.predict(input_df)[0])
    except Exception as exc:
        return (
            jsonify(
                {"error": f"Model inference error: {str(exc)}"}
            ),
            500,
        )

    # 4. Keep predicted score clamped between 0 and 100
    predicted_score = int(round(max(0.0, min(100.0, raw_prediction))))

    # 5. Determine performance level and recommendation message
    if predicted_score >= 85:
        performance_level = "Excellent"
        message = "The student is expected to perform exceptionally well."
    elif predicted_score >= 70:
        performance_level = "Good"
        message = "The student is expected to perform well."
    elif predicted_score >= 50:
        performance_level = "Average"
        message = "The student is expected to perform at an average level."
    else:
        performance_level = "Needs Improvement"
        message = "The student may need additional support to improve performance."

    # 6. Return response with both snake_case and camelCase keys
    response_payload = {
        "predicted_score": predicted_score,
        "performance_level": performance_level,
        "message": message,
        "predictedScore": predicted_score,
        "performanceLevel": performance_level,
    }

    return jsonify(response_payload), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting Student Predictor API on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
