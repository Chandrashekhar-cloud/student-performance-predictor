import { useState } from "react";
import {
  Users,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

interface BatchStudent {
  id: number;
  name: string;
  study_hours: number;
  attendance: number;
  previous_score: number;
  assignment_score: number;
  sleep_hours: number;
  predicted_score?: number;
  performance_level?: string;
}

const SAMPLE_COHORTS: Record<string, BatchStudent[]> = {
  "CS-101 (Diverse Section)": [
    { id: 1, name: "Lucas Vance", study_hours: 6.5, attendance: 88, previous_score: 78, assignment_score: 82, sleep_hours: 7.5 },
    { id: 2, name: "Maya Lin", study_hours: 9.0, attendance: 96, previous_score: 91, assignment_score: 94, sleep_hours: 7.0 },
    { id: 3, name: "Devon Carter", study_hours: 3.5, attendance: 65, previous_score: 52, assignment_score: 58, sleep_hours: 5.5 },
    { id: 4, name: "Sophia Martinez", study_hours: 5.0, attendance: 82, previous_score: 68, assignment_score: 70, sleep_hours: 8.0 },
    { id: 5, name: "Ethan Brooks", study_hours: 2.0, attendance: 55, previous_score: 42, assignment_score: 45, sleep_hours: 5.0 },
    { id: 6, name: "Chloe Bennett", study_hours: 7.5, attendance: 92, previous_score: 85, assignment_score: 88, sleep_hours: 7.5 },
    { id: 7, name: "Liam O'Connor", study_hours: 4.5, attendance: 75, previous_score: 64, assignment_score: 67, sleep_hours: 6.5 },
    { id: 8, name: "Aria Patel", study_hours: 8.5, attendance: 95, previous_score: 89, assignment_score: 92, sleep_hours: 7.0 },
    { id: 9, name: "Noah Campbell", study_hours: 2.5, attendance: 60, previous_score: 48, assignment_score: 50, sleep_hours: 6.0 },
    { id: 10, name: "Emma Watson", study_hours: 6.0, attendance: 85, previous_score: 75, assignment_score: 80, sleep_hours: 7.0 },
  ],
  "Honors Seminar": [
    { id: 1, name: "Ava Ross", study_hours: 8.0, attendance: 95, previous_score: 92, assignment_score: 95, sleep_hours: 7.5 },
    { id: 2, name: "Julian Hayes", study_hours: 9.5, attendance: 98, previous_score: 94, assignment_score: 96, sleep_hours: 7.0 },
    { id: 3, name: "Mia Takahashi", study_hours: 7.5, attendance: 94, previous_score: 88, assignment_score: 90, sleep_hours: 8.0 },
    { id: 4, name: "Oliver Scott", study_hours: 8.5, attendance: 92, previous_score: 90, assignment_score: 91, sleep_hours: 7.0 },
  ],
  "Academic Support Group": [
    { id: 1, name: "Tyler Reed", study_hours: 2.0, attendance: 58, previous_score: 45, assignment_score: 48, sleep_hours: 5.0 },
    { id: 2, name: "Zoe Morris", study_hours: 3.0, attendance: 64, previous_score: 50, assignment_score: 52, sleep_hours: 6.0 },
    { id: 3, name: "Marcus King", study_hours: 1.5, attendance: 52, previous_score: 38, assignment_score: 40, sleep_hours: 4.5 },
    { id: 4, name: "Hailey Cooper", study_hours: 4.0, attendance: 70, previous_score: 58, assignment_score: 62, sleep_hours: 6.5 },
  ],
};

import { API_BASE } from "../lib/api";

export function BatchPredictor() {
  const defaultCohort = "CS-101 (Diverse Section)";
  const [selectedCohort, setSelectedCohort] = useState<string>(defaultCohort);
  const [students, setStudents] = useState<BatchStudent[]>(SAMPLE_COHORTS[defaultCohort] || []);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluatedResults, setEvaluatedResults] = useState<BatchStudent[] | null>(null);
  const [summary, setSummary] = useState<{
    total_students: number;
    average_score: number;
    pass_rate_percent: number;
    at_risk_count: number;
    excellent_count: number;
  } | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleCohortSelect = (cohortName: string) => {
    setSelectedCohort(cohortName);
    setStudents(SAMPLE_COHORTS[cohortName] || []);
    setEvaluatedResults(null);
    setSummary(null);
  };

  const handleRunBatch = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch(`${API_BASE}/api/predictions/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Batch evaluation failed");
      }
      setEvaluatedResults(data.students);
      setSummary(data.summary);
    } catch (err) {
      console.error("Batch predict error:", err);
      // Fallback local calculation using formula if backend is unreachable
      const calculated = students.map((s) => {
        const raw =
          -2.535 +
          1.9117 * s.study_hours +
          0.1402 * s.attendance +
          0.3169 * s.previous_score +
          0.3333 * s.assignment_score +
          0.5529 * s.sleep_hours;
        const score = Math.max(0, Math.min(100, Math.round(raw)));
        const level =
          score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Average" : "Needs Improvement";
        return { ...s, predicted_score: score, performance_level: level };
      });
      const total = calculated.reduce((acc, curr) => acc + (curr.predicted_score || 0), 0);
      const atRisk = calculated.filter((s) => (s.predicted_score || 0) < 50).length;
      const exc = calculated.filter((s) => (s.predicted_score || 0) >= 85).length;
      setEvaluatedResults(calculated);
      setSummary({
        total_students: calculated.length,
        average_score: Math.round((total / calculated.length) * 10) / 10,
        pass_rate_percent: Math.round(((calculated.length - atRisk) / calculated.length) * 100),
        at_risk_count: atRisk,
        excellent_count: exc,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const exportToCSV = () => {
    const list = evaluatedResults || students;
    const headers = [
      "Student ID",
      "Name",
      "Study Hours",
      "Attendance %",
      "Previous Score",
      "Assignment Score",
      "Sleep Hours",
      "Predicted Score",
      "Performance Level",
    ];
    const rows = list.map((s) => [
      s.id,
      `"${s.name}"`,
      s.study_hours,
      s.attendance,
      s.previous_score,
      s.assignment_score,
      s.sleep_hours,
      s.predicted_score ?? "N/A",
      s.performance_level ?? "N/A",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `student_cohort_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter items for search
  const displayedStudents = (evaluatedResults || students).filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchFilter.toLowerCase());
    if (categoryFilter === "all") return matchesSearch;
    if (categoryFilter === "at_risk") return matchesSearch && (s.predicted_score || 0) < 50;
    if (categoryFilter === "excellent") return matchesSearch && (s.predicted_score || 0) >= 85;
    return matchesSearch;
  });

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Classroom Cohort Batch Evaluator
              </h2>
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                Educator Tool
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Run simultaneous machine learning predictions for an entire classroom or cohort roster.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleRunBatch}
            disabled={isEvaluating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50"
          >
            {isEvaluating ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>{evaluatedResults ? "Re-evaluate Cohort" : "Run Batch Predictions"}</span>
          </button>
        </div>
      </div>

      {/* Cohort Selector Pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-500">Preset Rosters:</span>
        {Object.keys(SAMPLE_COHORTS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => handleCohortSelect(name)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedCohort === name
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Summary Stat Cards (Appears after evaluation) */}
      {summary && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-in fade-in">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Enrolled</span>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{summary.total_students}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Class Average</span>
            <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">{summary.average_score}/100</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Passing Rate</span>
            <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.pass_rate_percent}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">At Risk (&lt;50)</span>
            <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{summary.at_risk_count}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search student name..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {evaluatedResults && (
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500">Filter:</span>
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                categoryFilter === "all" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400"
              }`}
            >
              All ({evaluatedResults.length})
            </button>
            <button
              onClick={() => setCategoryFilter("excellent")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                categoryFilter === "excellent" ? "bg-emerald-600 text-white" : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              Honors (≥85)
            </button>
            <button
              onClick={() => setCategoryFilter("at_risk")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                categoryFilter === "at_risk" ? "bg-rose-600 text-white" : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              }`}
            >
              At Risk (&lt;50)
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Study (hrs)</th>
              <th className="px-4 py-3">Attendance</th>
              <th className="px-4 py-3">Previous Score</th>
              <th className="px-4 py-3">Assignment</th>
              <th className="px-4 py-3">Sleep</th>
              <th className="px-4 py-3 text-right">Predicted Score</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedStudents.map((s) => (
              <tr
                key={s.id}
                className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {s.name}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.study_hours}h</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.attendance}%</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.previous_score}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.assignment_score}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.sleep_hours}h</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                  {s.predicted_score !== undefined ? (
                    <span className="inline-block rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-black text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {s.predicted_score}/100
                    </span>
                  ) : (
                    <span className="text-slate-400">Ready</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {s.performance_level ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        s.performance_level === "Excellent"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : s.performance_level === "Good"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : s.performance_level === "Average"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {s.performance_level}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Uncomputed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
