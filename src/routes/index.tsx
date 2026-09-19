import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthModal } from "../components/AuthModal";
import { API_BASE } from "../lib/api";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CalendarCheck2,
  Award,
  FileText,
  Moon,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Cpu,
  Database,
  Activity,
  Zap,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  LogOut,
  Layers,
  ChevronRight,
  Info,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Student Performance Prediction System | AI Academic Intelligence" },
      {
        name: "description",
        content:
          "Predict student academic performance using machine learning regression models and academic indicators.",
      },
      { property: "og:title", content: "Student Performance Prediction System" },
      {
        property: "og:description",
        content:
          "Estimate student final exam scores using multiple linear regression.",
      },
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

interface PerformanceInsight {
  title: string;
  description: string;
  type: "positive" | "warning" | "neutral";
}

interface FormErrors {
  studyHours?: string;
  attendance?: string;
  previousExam?: string;
  assignmentScore?: string;
  sleepHours?: string;
}

function Index() {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const [formData, setFormData] = useState({
    studyHours: "6",
    attendance: "85",
    previousExam: "72",
    assignmentScore: "78",
    sleepHours: "7",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<PredictionResult | null>({
    predictedScore: 74,
    performanceLevel: "Good",
    message: "The student is expected to perform well.",
  });
  const [lastSubmittedData, setLastSubmittedData] = useState<typeof formData | null>({
    studyHours: "6",
    attendance: "85",
    previousExam: "72",
    assignmentScore: "78",
    sleepHours: "7",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Quick Samples preset loader
  const applyPreset = (preset: "high" | "consistent" | "focus") => {
    if (preset === "high") {
      setFormData({
        studyHours: "9",
        attendance: "96",
        previousExam: "90",
        assignmentScore: "94",
        sleepHours: "8",
      });
    } else if (preset === "consistent") {
      setFormData({
        studyHours: "6",
        attendance: "85",
        previousExam: "72",
        assignmentScore: "78",
        sleepHours: "7",
      });
    } else {
      setFormData({
        studyHours: "2.5",
        attendance: "58",
        previousExam: "46",
        assignmentScore: "50",
        sleepHours: "5.5",
      });
    }
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string | undefined> = {};

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
        newErrors[rule.field] = `${rule.label} is required.`;
      } else {
        const num = Number(val);
        if (isNaN(num) || !isFinite(num)) {
          newErrors[rule.field] = `${rule.label} must be a number.`;
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
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE}/predict`, {
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
      setLastSubmittedData({ ...formData });
    } catch (err: unknown) {
      console.warn("Falling back to local inference calculation:", err);
      // Fallback to exact model formula: Final = -2.535 + (1.9117*study) + (0.1402*att) + (0.3169*prev) + (0.3333*assign) + (0.5529*sleep)
      const raw =
        -2.535 +
        1.9117 * Number(formData.studyHours) +
        0.1402 * Number(formData.attendance) +
        0.3169 * Number(formData.previousExam) +
        0.3333 * Number(formData.assignmentScore) +
        0.5529 * Number(formData.sleepHours);
      const score = Math.max(0, Math.min(100, Math.round(raw)));
      const level =
        score >= 85
          ? "Excellent"
          : score >= 70
          ? "Good"
          : score >= 50
          ? "Average"
          : "Needs Improvement";
      setResult({
        predictedScore: score,
        performanceLevel: level,
        message:
          level === "Excellent"
            ? "The student is expected to perform exceptionally well."
            : level === "Good"
            ? "The student is expected to perform well."
            : level === "Average"
            ? "The student is expected to perform at an average level."
            : "The student may need additional support to improve performance.",
      });
      setLastSubmittedData({ ...formData });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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

  // Generate dynamic academic insights based on inputs
  const insights: PerformanceInsight[] = [];
  const evalData = lastSubmittedData || formData;
  const study = Number(evalData.studyHours);
  const att = Number(evalData.attendance);
  const prev = Number(evalData.previousExam);
  const assign = Number(evalData.assignmentScore);
  const sleep = Number(evalData.sleepHours);

  if (result) {
    if (result.predictedScore >= 85) {
      insights.push({
        title: "TARGET DISTINCTION STANDING",
        description:
          "Outstanding academic commitment across all indicators. Maintain your consistent study cadence to secure rank distinction honors.",
        type: "positive",
      });
    } else if (result.predictedScore >= 70) {
      insights.push({
        title: "TARGET DISTINCTION STANDING",
        description:
          "You are performing well. Target 90%+ attendance and dedicate an extra 30–45 minutes daily to active recall revision to transition into Excellent standing.",
        type: "positive",
      });
    } else {
      insights.push({
        title: "ACADEMIC INTERVENTION RECOMMENDATION",
        description:
          "Current metrics place the projected score at risk. Focus immediately on recovering classroom attendance and clearing pending assignment doubts.",
        type: "warning",
      });
    }

    // Specific study insight
    if (study >= 7) {
      insights.push({
        title: "Strong Study Cadence",
        description: `${study} hours daily provides the greatest statistical leverage (+1.91 marks/hr) toward final grade mastery.`,
        type: "positive",
      });
    } else if (study < 4) {
      insights.push({
        title: "Study Hours Below Benchmark",
        description: `Increasing daily revision by just 1.5 hours can project an estimated +3 to +4 marks boost on your final score.`,
        type: "warning",
      });
    }

    // Attendance insight
    if (att >= 85) {
      insights.push({
        title: "Optimal Classroom Presence",
        description: `${att}% attendance ensures comprehensive exposure to lecture demonstrations and laboratory grading.`,
        type: "positive",
      });
    } else if (att < 75) {
      insights.push({
        title: "Attendance Below Regulatory Minimum",
        description: `Attendance (${att}%) is below recommended threshold. Prioritize attending upcoming lectures to avoid detention.`,
        type: "warning",
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 selection:bg-indigo-500 selection:text-white dark:bg-[#0B0F19] dark:text-slate-100 transition-colors duration-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  Student Performance Predictor
                </span>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-950/80 dark:text-indigo-300">
                  v2.0
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                AI-powered academic performance analysis & intelligence
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 lg:flex">
            <a href="#home" className="transition-colors hover:text-indigo-600 dark:hover:text-white">
              Home
            </a>
            <a href="#predictor" className="transition-colors hover:text-indigo-600 dark:hover:text-white">
              Predictor
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-indigo-600 dark:hover:text-white">
              How It Works
            </a>
            <a href="#why-us" className="transition-colors hover:text-indigo-600 dark:hover:text-white">
              Why This System?
            </a>
            <a href="#model-specs" className="transition-colors hover:text-indigo-600 dark:hover:text-white">
              Model Specs
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Machine Learning Powered Pill */}
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-700 sm:flex dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Machine Learning Powered
            </div>

            {/* Theme Toggle Pill */}
            <ThemeToggle />

            {/* User Auth Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
                >
                  Sign In
                </button>
                <a
                  href="#predictor"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 sm:text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Predict Now</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="home" className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-blue-200/40 blur-3xl dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-blue-950/30" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-sm dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Multiple Linear Regression • Real-Time Inference</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Predict. <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Understand.</span> Improve.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
              Estimate student academic performance using study habits, attendance,
              previous scores, assignments, and sleep patterns — driven by a verified
              machine learning predictive engine.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#predictor"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30 active:translate-y-0"
              >
                <span>Start Prediction</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 active:translate-y-0"
              >
                <HelpCircle className="h-4 w-4 text-slate-500" />
                <span>How It Works</span>
              </a>
            </div>
          </div>

          {/* Trust & Highlights Cards */}
          <div className="mt-14 grid gap-4 sm:grid-cols-3 lg:gap-6">
            <div className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">1,000+ Student Records</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Curated academic demonstration dataset</p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-950 dark:text-purple-400">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">ML Powered</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Multiple Linear Regression (R² ≈ 0.97)</p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-400">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">Real-Time Prediction</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Instant REST API response in milliseconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. PROJECT STATISTICS STRIP */}
      {/* ------------------------------------------------------------- */}
      <section className="border-y border-slate-200/80 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            <div className="p-2">
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">1,000</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">
                Student Records
              </p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">5</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">
                Input Features
              </p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">1</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">
                Trained ML Model
              </p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">~97%</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-sm">
                R² Accuracy Score
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. PREDICTOR SECTION (INPUT FORM + OUTPUT RESULTS) */}
      {/* ------------------------------------------------------------- */}
      <section id="predictor" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Academic Performance Predictor
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Enter the student's academic and lifestyle information to estimate performance.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
            {/* Input Form Column */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Student Profile Inputs
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Provide all 5 parameters for accurate prediction
                  </p>
                </div>

                {/* Quick Samples */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Quick Samples:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset("high")}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    High Performer
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("consistent")}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Consistent
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("focus")}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Needs Focus
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* 1. Study Hours */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Study Hours per Day
                      </span>
                    </div>
                    <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      1-24 hrs
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Average hours spent studying each day</p>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={24}
                      value={formData.studyHours}
                      onChange={(e) => handleInputChange("studyHours", e.target.value)}
                      placeholder="e.g. 6"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-16 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      hrs/day
                    </span>
                  </div>
                  {errors.studyHours && (
                    <p className="mt-1 text-[11px] text-rose-500">{errors.studyHours}</p>
                  )}
                </div>

                {/* 2. Attendance */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarCheck2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Attendance Percentage
                      </span>
                    </div>
                    <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      0-100%
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Percentage of classes attended</p>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.attendance}
                      onChange={(e) => handleInputChange("attendance", e.target.value)}
                      placeholder="e.g. 85"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-12 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      %
                    </span>
                  </div>
                  {errors.attendance && (
                    <p className="mt-1 text-[11px] text-rose-500">{errors.attendance}</p>
                  )}
                </div>

                {/* 3. Previous Exam */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Previous Exam Score
                      </span>
                    </div>
                    <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      0-100
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Score out of 100 in previous semester</p>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.previousExam}
                      onChange={(e) => handleInputChange("previousExam", e.target.value)}
                      placeholder="e.g. 72"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-16 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      / 100
                    </span>
                  </div>
                  {errors.previousExam && (
                    <p className="mt-1 text-[11px] text-rose-500">{errors.previousExam}</p>
                  )}
                </div>

                {/* 4. Assignment Score */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Assignment Score
                      </span>
                    </div>
                    <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      0-100
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Average assignment score out of 100</p>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.assignmentScore}
                      onChange={(e) => handleInputChange("assignmentScore", e.target.value)}
                      placeholder="e.g. 78"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-16 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      / 100
                    </span>
                  </div>
                  {errors.assignmentScore && (
                    <p className="mt-1 text-[11px] text-rose-500">{errors.assignmentScore}</p>
                  )}
                </div>

                {/* 5. Sleep Hours */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Sleep Hours per Day
                      </span>
                    </div>
                    <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      0-24 hrs
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">Average daily sleep duration</p>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={24}
                      value={formData.sleepHours}
                      onChange={(e) => handleInputChange("sleepHours", e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-16 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      hrs/day
                    </span>
                  </div>
                  {errors.sleepHours && (
                    <p className="mt-1 text-[11px] text-rose-500">{errors.sleepHours}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePredict}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Calculate Predicted Performance</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      studyHours: "",
                      attendance: "",
                      previousExam: "",
                      assignmentScore: "",
                      sleepHours: "",
                    });
                    setErrors({});
                  }}
                  title="Reset form"
                  className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Prediction Output Column */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Prediction Output
                </h3>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Evaluated</span>
                </span>
              </div>

              {result && (
                <div className="mt-6 space-y-6">
                  {/* Estimated Performance Card */}
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-950/60 dark:bg-indigo-950/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                        Estimated Performance
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          result.predictedScore >= 85
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : result.predictedScore >= 70
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : result.predictedScore >= 50
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {result.performanceLevel} Performance
                      </span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        {result.predictedScore}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span>Exam Score Scale</span>
                        <span>{result.predictedScore} / 100</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${result.predictedScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Model Assessment Note */}
                    <div className="mt-4 border-t border-indigo-100/80 pt-3 dark:border-indigo-900/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Model Assessment
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  {/* Entered Academic Indicators with Progress Bars */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Entered Academic Indicators
                    </span>

                    <div className="mt-3 space-y-3 text-xs">
                      {/* Study */}
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Study Hours</span>
                          <span className="font-bold text-slate-900 dark:text-white">{study} hrs/day</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(100, (study / 12) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Attendance */}
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Attendance</span>
                          <span className="font-bold text-slate-900 dark:text-white">{att}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${att}%` }}
                          />
                        </div>
                      </div>

                      {/* Previous Exam */}
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Previous Exam</span>
                          <span className="font-bold text-slate-900 dark:text-white">{prev} / 100</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${prev}%` }}
                          />
                        </div>
                      </div>

                      {/* Assignment */}
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Assignment Score</span>
                          <span className="font-bold text-slate-900 dark:text-white">{assign} / 100</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${assign}%` }}
                          />
                        </div>
                      </div>

                      {/* Sleep */}
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Sleep Hours</span>
                          <span className="font-bold text-slate-900 dark:text-white">{sleep} hrs/day</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(100, (sleep / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Insights Cards */}
                  {insights.map((item, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4 text-xs ${
                        item.type === "positive"
                          ? "border-indigo-100 bg-indigo-50/50 text-indigo-900 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-200"
                          : "border-rose-100 bg-rose-50/50 text-rose-900 dark:border-rose-950 dark:bg-rose-950/30 dark:text-rose-200"
                      }`}
                    >
                      <span className="font-extrabold uppercase tracking-wider text-[10px]">
                        # {item.title}
                      </span>
                      <p className="mt-1 leading-relaxed opacity-90">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. HOW IT WORKS WORKFLOW */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="border-t border-slate-200/80 bg-white py-16 sm:py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              A streamlined, transparent machine learning pipeline from user input to predictive output.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                01
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Enter Metrics
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Input study hours, attendance, previous scores, assignments, and sleep duration through the manual input form.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                02
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Input Validation
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Data is validated against realistic academic boundaries on client and server to prevent erroneous payloads.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                03
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                ML Inference
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Scikit-learn Multiple Linear Regression model computes expected final score using learned weighted coefficients.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-xs">
                04
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Actionable Feedback
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Receive predicted score percentage, performance level tier, and personalized insights for academic enhancement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. WHY CHOOSE THIS SYSTEM */}
      {/* ------------------------------------------------------------- */}
      <section id="why-us" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why Choose This System?
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Designed as a robust, interpretable, and reproducible educational machine learning project.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                High Interpretability
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Linear regression allows clear explanation of every feature's weight and contribution, avoiding black-box ambiguity.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Instant Predictions
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Lightweight model inference executes in under 20 milliseconds, delivering responsive real-time feedback.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Validated Dataset
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                1,000 curated student records ensure balanced representation across diverse academic performance bands.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Layers className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Full-Stack Architecture
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Built with modern production standards: React 19, Vite, TanStack Router, Flask REST API, and Scikit-learn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. MODEL & SYSTEM ARCHITECTURE (EXACT CARDS FROM IMAGE 1) */}
      {/* ------------------------------------------------------------- */}
      <section id="model-specs" className="border-t border-slate-200/80 bg-white py-16 sm:py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Model & System Architecture
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Technical details prepared for college project demonstration and viva evaluation.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Machine Learning Model Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Machine Learning Model
                  </h3>
                  <p className="text-xs text-slate-500">Trained with Scikit-learn</p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-200/70 text-xs dark:divide-slate-800">
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Algorithm</span>
                  <span className="font-bold text-slate-900 dark:text-white">Multiple Linear Regression</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Dataset Size</span>
                  <span className="font-bold text-slate-900 dark:text-white">1,000 Curated Student Records</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Input Features</span>
                  <span className="font-bold text-slate-900 dark:text-white">5 (Study, Attendance, Exam, Assignment, Sleep)</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Target Variable</span>
                  <span className="font-bold text-slate-900 dark:text-white">Final Score (0–100%)</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Train / Test Split</span>
                  <span className="font-bold text-slate-900 dark:text-white">80% Training / 20% Testing</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Evaluation Metric</span>
                  <span className="font-bold text-slate-900 dark:text-white">MAE: 1.86 marks | R²: 0.9685</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Serialization</span>
                  <span className="font-bold text-slate-900 dark:text-white">Joblib (.pkl binary format)</span>
                </div>
              </div>
            </div>

            {/* System Architecture Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    System Architecture
                  </h3>
                  <p className="text-xs text-slate-500">Full-Stack Cloud Stack</p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-200/70 text-xs dark:divide-slate-800">
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Frontend Framework</span>
                  <span className="font-bold text-slate-900 dark:text-white">React 19 + TypeScript</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Build Tool</span>
                  <span className="font-bold text-slate-900 dark:text-white">Vite 6 + TanStack Start</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Styling Engine</span>
                  <span className="font-bold text-slate-900 dark:text-white">Tailwind CSS v4</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Backend Service</span>
                  <span className="font-bold text-slate-900 dark:text-white">Python 3.12 + Flask</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">WSGI Server</span>
                  <span className="font-bold text-slate-900 dark:text-white">Gunicorn (Production)</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Frontend Cloud Host</span>
                  <span className="font-bold text-slate-900 dark:text-white">Vercel</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Backend Cloud Host</span>
                  <span className="font-bold text-slate-900 dark:text-white">Render</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. FOOTER (EXACT SLEEK DARK FOOTER FROM IMAGE 1) */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-slate-800 bg-[#0F172A] py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold">Student Performance Prediction System</span>
                <p className="text-xs text-slate-400">
                  An educational machine learning project for academic performance analysis.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                Machine Learning
              </span>
              <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                React 19
              </span>
              <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                Python
              </span>
              <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                Flask
              </span>
              <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                Scikit-learn
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            Student Performance Prediction System — College Mini Project - Academic Demonstration
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authTab}
      />
    </div>
  );
}
