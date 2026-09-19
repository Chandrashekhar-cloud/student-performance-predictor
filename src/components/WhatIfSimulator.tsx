import { useState, useMemo } from "react";
import {
  Sliders,
  TrendingUp,
  Sparkles,
  BookOpen,
  CalendarCheck2,
  Award,
  FileText,
  Moon,
  ArrowRight,
  RotateCcw,
  Zap,
} from "lucide-react";

interface WhatIfSimulatorProps {
  initialValues?: {
    studyHours: number;
    attendance: number;
    previousExam: number;
    assignmentScore: number;
    sleepHours: number;
  };
  onApplyToPredictor?: (values: {
    studyHours: string;
    attendance: string;
    previousExam: string;
    assignmentScore: string;
    sleepHours: string;
  }) => void;
}

export function WhatIfSimulator({ initialValues, onApplyToPredictor }: WhatIfSimulatorProps) {
  const [studyHours, setStudyHours] = useState<number>(initialValues?.studyHours || 5);
  const [attendance, setAttendance] = useState<number>(initialValues?.attendance || 80);
  const [previousExam, setPreviousExam] = useState<number>(initialValues?.previousExam || 70);
  const [assignmentScore, setAssignmentScore] = useState<number>(initialValues?.assignmentScore || 75);
  const [sleepHours, setSleepHours] = useState<number>(initialValues?.sleepHours || 7);

  // Baseline values for delta comparison
  const baseline = useMemo(() => {
    return {
      study: initialValues?.studyHours || 5,
      att: initialValues?.attendance || 80,
      prev: initialValues?.previousExam || 70,
      assign: initialValues?.assignmentScore || 75,
      sleep: initialValues?.sleepHours || 7,
    };
  }, [initialValues]);

  // Exact model regression formula calculation:
  // Final = -2.535 + (1.9117 * Study) + (0.1402 * Att) + (0.3169 * Prev) + (0.3333 * Assign) + (0.5529 * Sleep)
  const calculateScore = (
    s: number,
    att: number,
    prev: number,
    assign: number,
    slp: number
  ) => {
    const raw =
      -2.535 +
      1.9117 * s +
      0.1402 * att +
      0.3169 * prev +
      0.3333 * assign +
      0.5529 * slp;
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  const currentScore = useMemo(
    () => calculateScore(studyHours, attendance, previousExam, assignmentScore, sleepHours),
    [studyHours, attendance, previousExam, assignmentScore, sleepHours]
  );

  const baselineScore = useMemo(
    () => calculateScore(baseline.study, baseline.att, baseline.prev, baseline.assign, baseline.sleep),
    [baseline]
  );

  const delta = currentScore - baselineScore;

  const getLevel = (score: number) => {
    if (score >= 85) return { text: "Excellent", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" };
    if (score >= 70) return { text: "Good", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800" };
    if (score >= 50) return { text: "Average", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" };
    return { text: "Needs Improvement", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" };
  };

  const levelInfo = getLevel(currentScore);

  const resetToBaseline = () => {
    setStudyHours(baseline.study);
    setAttendance(baseline.att);
    setPreviousExam(baseline.prev);
    setAssignmentScore(baseline.assign);
    setSleepHours(baseline.sleep);
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                "What-If" Sensitivity Simulator
              </h2>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Live Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag the sliders below to explore how changes in study habits immediately alter expected outcomes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToBaseline}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          {onApplyToPredictor && (
            <button
              type="button"
              onClick={() =>
                onApplyToPredictor({
                  studyHours: String(studyHours),
                  attendance: String(attendance),
                  previousExam: String(previousExam),
                  assignmentScore: String(assignmentScore),
                  sleepHours: String(sleepHours),
                })
              }
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
            >
              <span>Apply to Form</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Study Hours Slider */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Study Hours</span>
              </div>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-extrabold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                {studyHours} hrs/day
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={16}
              step={0.5}
              value={studyHours}
              onChange={(e) => setStudyHours(parseFloat(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>1 hr (Low)</span>
              <span>8 hrs (Recommended)</span>
              <span>16 hrs (Intense)</span>
            </div>
          </div>

          {/* Attendance Slider */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Attendance Percentage</span>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                {attendance}%
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={1}
              value={attendance}
              onChange={(e) => setAttendance(parseFloat(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-700"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>40% (Minimum)</span>
              <span>75% (Standard)</span>
              <span>100% (Perfect)</span>
            </div>
          </div>

          {/* Assignment Score Slider */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Assignment Score</span>
              </div>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-extrabold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                {assignmentScore}/100
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={1}
              value={assignmentScore}
              onChange={(e) => setAssignmentScore(parseFloat(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-700"
            />
          </div>

          {/* Previous Exam Slider */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Previous Exam Score</span>
              </div>
              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-extrabold text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                {previousExam}/100
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={1}
              value={previousExam}
              onChange={(e) => setPreviousExam(parseFloat(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-purple-600 dark:bg-slate-700"
            />
          </div>

          {/* Sleep Hours Slider */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Sleep Duration</span>
              </div>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-extrabold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                {sleepHours} hrs/night
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-500 dark:bg-slate-700"
            />
          </div>
        </div>

        {/* Live Forecast Preview Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 via-white to-purple-50/40 p-6 shadow-sm dark:border-slate-800 dark:from-slate-800/60 dark:via-slate-900 dark:to-indigo-950/20 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Simulated Output
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${levelInfo.color}`}
              >
                {levelInfo.text}
              </span>
            </div>

            {/* Big Score Display */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-baseline justify-center">
                <span className="text-6xl font-black tracking-tight text-slate-900 dark:text-white sm:text-7xl">
                  {currentScore}
                </span>
                <span className="ml-1 text-2xl font-bold text-slate-400">/100</span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Estimated Final Exam Score
              </p>

              {/* Delta Tag */}
              <div className="mt-4 flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    delta > 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : delta < 0
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>
                    {delta > 0 ? `+${delta}` : delta} marks compared to baseline ({baselineScore})
                  </span>
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Passing Mark (50)</span>
                <span>Honor Roll (85)</span>
              </div>
              <div className="relative mt-2 h-3.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${currentScore}%` }}
                />
              </div>
            </div>

            {/* Smart Sensitivity Note */}
            <div className="mt-6 rounded-2xl border border-indigo-200/60 bg-white/80 p-3.5 text-xs text-slate-600 backdrop-blur-xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                <Zap className="h-3.5 w-3.5" />
                <span>Feature Sensitivity Insight:</span>
              </div>
              <p className="mt-1 leading-relaxed">
                {studyHours >= 8
                  ? "High daily study commitment yields the greatest single lever (+1.91 marks per hour) on final examination performance."
                  : attendance < 75
                  ? "Warning: Attendance under 75% dampens score recovery. Prioritize classroom presence to lift your projected score."
                  : "Every additional hour of focused daily study provides an estimated +1.91 mark boost on your final grade."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
