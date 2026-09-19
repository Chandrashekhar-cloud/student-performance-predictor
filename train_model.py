"""
Student Performance Prediction System - Model Training Script
Algorithm: Multiple Linear Regression
Description: Beginner-friendly script for training and evaluating a regression model
             to predict student final exam scores based on academic and lifestyle factors.
"""

import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score


def main():
    print("=" * 60)
    print("  Student Performance Prediction System - Model Training")
    print("=" * 60)

    # -------------------------------------------------------------
    # Step 1: Load the Dataset
    # -------------------------------------------------------------
    # Determine the directory where this script resides for reliable paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "data", "student_performance.csv")

    # Fallback to local 'data/student_performance.csv' if running elsewhere
    if not os.path.exists(csv_path):
        csv_path = os.path.join("data", "student_performance.csv")

    print(f"\n[Step 1] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"-> Successfully loaded {len(df)} student records.")
    print("-> Sample data preview:")
    print(df.head(3))

    # -------------------------------------------------------------
    # Step 2: Separate Input Features (X) and Target Variable (y)
    # -------------------------------------------------------------
    feature_columns = [
        "study_hours",
        "attendance",
        "previous_score",
        "assignment_score",
        "sleep_hours",
    ]
    target_column = "final_score"

    X = df[feature_columns]
    y = df[target_column]

    print("\n[Step 2] Feature and Target Separation:")
    print(f"-> Features (X): {feature_columns}")
    print(f"-> Target   (y): {target_column}")

    # -------------------------------------------------------------
    # Step 3: Split the Data into Training (80%) and Testing (20%) Sets
    # -------------------------------------------------------------
    # random_state=42 ensures the train-test split is reproducible
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("\n[Step 3] Train-Test Split:")
    print(f"-> Training samples: {len(X_train)} (80%)")
    print(f"-> Testing samples : {len(X_test)} (20%)")

    # -------------------------------------------------------------
    # Step 4: Train the Linear Regression Model
    # -------------------------------------------------------------
    print("\n[Step 4] Training Linear Regression Model...")
    model = LinearRegression()
    model.fit(X_train, y_train)
    print("-> Model training complete.")

    # Display learned feature weights (coefficients) and bias (intercept)
    print("\nLearned Model Parameters:")
    for feature, coef in zip(feature_columns, model.coef_):
        print(f"  - Weight for {feature:18s}: {coef:+.4f}")
    print(f"  - Model Intercept (bias)           : {model.intercept_:+.4f}")

    # -------------------------------------------------------------
    # Step 5: Evaluate Model Performance (MAE and R²)
    # -------------------------------------------------------------
    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"\n[Step 5] Evaluation Metrics on Test Set ({len(X_test)} records):")
    print(f"-> Mean Absolute Error (MAE) : {mae:.2f} marks (average prediction error)")
    print(f"-> R-squared Score (R²)      : {r2:.4f} ({r2 * 100:.1f}% variance explained)")

    # -------------------------------------------------------------
    # Step 6: Save the Trained Model
    # -------------------------------------------------------------
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, "student_performance_model.pkl")
    joblib.dump(model, model_path)

    print("\n[Step 6] Model Export:")
    print(f"-> Trained model saved to: {model_path}")
    print("=" * 60)
    print("  Training Completed Successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
