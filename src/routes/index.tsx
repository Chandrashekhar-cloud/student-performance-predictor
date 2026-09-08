import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Student Performance Prediction System" },
      { name: "description", content: "Predict student academic performance using machine learning." },
      { property: "og:title", content: "Student Performance Prediction System" },
      { property: "og:description", content: "Predict student academic performance using machine learning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

interface PredictionResult {
  predictedScore: number;
  performanceLevel: string;
  message: string;
}

function Index() {
  const [formData, setFormData] = useState({
    studyHours: "",
    attendance: "",
    previousExam: "",
    assignmentScore: "",
    sleepHours: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const validationRules: {
      field: keyof typeof formData;
      label: string;
      min: number;
      max: number;
    }[] = [
      { field: "studyHours", label: "Study Hours", min: 1, max: 24 },
      { field: "attendance", label: "Attendance Percentage", min: 0, max: 100 },
      { field: "previousExam", label: "Previous Exam Score", min: 0, max: 100 },
      { field: "assignmentScore", label: "Assignment Score", min: 0, max: 100 },
      { field: "sleepHours", label: "Sleep Hours", min: 0, max: 24 },
    ];

    for (const rule of validationRules) {
      const val = formData[rule.field];
      if (val === undefined || val === null || val.trim() === "") {
        newErrors[rule.field] = `${rule.label} is required and cannot be empty.`;
      } else {
        const num = Number(val);
        if (isNaN(num) || !isFinite(num)) {
          newErrors[rule.field] = `${rule.label} must be a valid number.`;
        } else if (num < rule.min || num > rule.max) {
          newErrors[rule.field] = `${rule.label} must be between ${rule.min} and ${rule.max}.`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePredict = async () => {
    if (!validateForm()) {
      setResult(null);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    const apiBaseUrl = (
      import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
    ).replace(/\/+$/, "");

    try {
      const response = await fetch(`${apiBaseUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          study_hours: Number(formData.studyHours),
          attendance: Number(formData.attendance),
          previous_score: Number(formData.previousExam),
          assignment_score: Number(formData.assignmentScore),
          sleep_hours: Number(formData.sleepHours),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResult({
        predictedScore: data.predicted_score ?? data.predictedScore,
        performanceLevel: data.performance_level ?? data.performanceLevel,
        message: data.message,
      });
    } catch (err: unknown) {
      console.error("Prediction error:", err);
      setResult(null);
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setApiError(
          `Unable to connect to Flask backend (${apiBaseUrl}). Please make sure the server is running.`
        );
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Failed to fetch prediction from the server. Please check your backend.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (apiError) {
      setApiError(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Student Performance Prediction System
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Predict student academic performance using machine learning
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Input Section */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Student Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the details below to get a performance prediction.
            </p>

            <div className="mt-6 space-y-5">
              <FormField
                label="Study Hours per Day"
                id="studyHours"
                value={formData.studyHours}
                error={errors['studyHours']}
                min={1}
                max={24}
                step={0.5}
                onChange={(value) => handleInputChange("studyHours", value)}
              />
              <FormField
                label="Attendance Percentage"
                id="attendance"
                value={formData.attendance}
                error={errors['attendance']}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(value) => handleInputChange("attendance", value)}
              />
              <FormField
                label="Previous Exam Score"
                id="previousExam"
                value={formData.previousExam}
                error={errors['previousExam']}
                min={0}
                max={100}
                step={1}
                suffix="/ 100"
                onChange={(value) => handleInputChange("previousExam", value)}
              />
              <FormField
                label="Assignment Score"
                id="assignmentScore"
                value={formData.assignmentScore}
                error={errors['assignmentScore']}
                min={0}
                max={100}
                step={1}
                suffix="/ 100"
                onChange={(value) => handleInputChange("assignmentScore", value)}
              />
              <FormField
                label="Sleep Hours per Day"
                id="sleepHours"
                value={formData.sleepHours}
                error={errors['sleepHours']}
                min={0}
                max={24}
                step={0.5}
                onChange={(value) => handleInputChange("sleepHours", value)}
              />
            </div>

            <button
              onClick={handlePredict}
              disabled={isLoading}
              className="mt-8 w-full rounded-lg bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Predicting..." : "Predict Performance"}
            </button>
          </section>

          {/* Results Section */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Prediction Result</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The predicted academic performance will appear here.
            </p>

            {apiError && !isLoading && (
              <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-destructive">
                <div className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mt-0.5 shrink-0 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-sm">Backend Connection Notice</h3>
                    <p className="mt-1 text-xs leading-relaxed text-destructive/90">
                      {apiError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!result && !isLoading && !apiError && (
              <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-12 text-center">
                <div className="rounded-full bg-secondary p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-secondary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Fill in the form and click "Predict Performance" to see the result.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
                <p className="mt-3 text-sm text-muted-foreground">Running prediction model...</p>
              </div>
            )}

            {result && !isLoading && (
              <div className="mt-6 rounded-xl bg-secondary p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-secondary-foreground">Predicted Score</span>
                  <span className="text-3xl font-bold text-foreground">{result.predictedScore}%</span>
                </div>

                <div className="mt-4">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${result.predictedScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-card p-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Performance Level
                    </span>
                    <p className="mt-1 text-lg font-semibold text-foreground">{result.performanceLevel}</p>
                  </div>
                  <div className="rounded-lg bg-card p-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</span>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">{result.message}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* How It Works */}
        <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">How It Works</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <StepCard
              step={1}
              title="Input Student Data"
              description="Enter academic and lifestyle details such as study hours, attendance, and sleep."
            />
            <StepCard
              step={2}
              title="Machine Learning Model"
              description="The data is processed by a trained model that learns from historical student records."
            />
            <StepCard
              step={3}
              title="Performance Prediction"
              description="The system outputs an estimated score along with a performance level and message."
            />
          </div>
        </section>

        {/* About Project */}
        <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">About Project</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The <strong className="text-foreground">Student Performance Prediction System</strong> is an educational
            machine learning project designed to estimate a student's expected academic performance. It uses inputs
            such as study habits, attendance, previous exam results, assignment scores, and sleep patterns to generate
            a predicted score and performance category. This project demonstrates how machine learning concepts can be
            applied to real-world educational data in a simple and interpretable way.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          Student Performance Prediction System — College Mini Project
        </div>
      </footer>
    </div>
  );
}

function FormField({
  label,
  id,
  value,
  error,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  error?: string | undefined;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full rounded-lg border bg-background px-4 py-2.5 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
            error ? "border-destructive focus:border-destructive focus:ring-destructive" : "border-input"
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-border bg-background p-5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {step}
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
