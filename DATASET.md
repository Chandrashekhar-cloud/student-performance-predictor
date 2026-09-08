# Student Performance Dataset (Curated Sample Dataset)

## 1. Dataset Purpose
This dataset was specifically created and curated for the **Student Performance Prediction System** college mini project. Its primary purpose is to provide a clean, realistic, and interpretable set of academic and behavioral indicators to train, evaluate, and demonstrate educational machine learning regression models (such as Multiple Linear Regression or Random Forest Regressor).

> **Note on Data Source**: This dataset is a curated synthetic demonstration dataset designed specifically for this mini project. It does not originate from Kaggle or any third-party repository, avoiding external licensing constraints or proprietary student privacy concerns.

---

## 2. Number of Records
* **Total Rows**: 100 student records
* **File Format**: Standard CSV (`student_performance.csv`)
* **Missing Values / Nulls**: 0 (pre-cleaned and validated)

---

## 3. Dataset Columns & Descriptions

| Column Name | Data Type | Permissible Range | Description |
| :--- | :--- | :--- | :--- |
| `study_hours` | Float | 1.0 – 10.0 | Average self-study hours spent per day outside lecture hours. |
| `attendance` | Integer | 40 – 100 | Percentage of classes attended by the student (%). |
| `previous_score` | Integer | 30 – 100 | Score obtained in the preceding internal semester exam (out of 100). |
| `assignment_score` | Integer | 30 – 100 | Average grade obtained across homework assignments and lab tasks (out of 100). |
| `sleep_hours` | Float | 4.0 – 10.0 | Average daily sleep duration in hours. |
| `final_score` | Integer | 30 – 100 | **Target Variable**: Final examination score / overall academic performance (out of 100). |

---

## 4. How the Dataset is Used
1. **Model Training & Feature Selection**:
   * The first 5 attributes (`study_hours`, `attendance`, `previous_score`, `assignment_score`, and `sleep_hours`) serve as input features ($X$).
   * `final_score` acts as the continuous ground-truth target variable ($y$).
2. **Model Evaluation**:
   * The data is split into training and testing partitions (e.g., 80% train / 20% test) to calculate standard evaluation metrics such as Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and the Coefficient of Determination ($R^2$).
3. **Inference Pipeline**:
   * The trained regression model artifacts (saved via `joblib` or `pickle`) are loaded by the Flask API server.
   * When a user enters student metrics into the web frontend and clicks "Predict Performance", the features are fed into the model to predict the expected `final_score`.

---

## 5. Dataset Limitations
* **Educational Demonstration Scope**: The dataset is intentionally compact (100 samples) and tailored for rapid training, lightweight deployment, and laptop-based project demonstrations.
* **Feature Scope**: Does not capture non-academic confounding factors such as socio-economic background, health emergencies, course difficulty variations, or extracurricular commitments.
* **Linearity & Regularity**: While realistic statistical noise and variance have been introduced, real-world educational data exhibits higher variance, outliers, and institutional discrepancies.
