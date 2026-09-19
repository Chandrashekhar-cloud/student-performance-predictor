import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  History,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  User,
  ArrowUpRight,
  BookOpen,
  LogIn,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface HistoryItem {
  id: number;
  student_name: string;
  study_hours: number;
  attendance: number;
  previous_score: number;
  assignment_score: number;
  sleep_hours: number;
  predicted_score: number;
  performance_level: string;
  notes?: string;
  created_at: string;
}

import { API_BASE } from "../lib/api";

interface HistoryDashboardProps {
  onOpenAuthModal?: () => void;
  onSelectPrediction?: (item: HistoryItem) => void;
}

export function HistoryDashboard({ onOpenAuthModal, onSelectPrediction }: HistoryDashboardProps) {
  const { user, token, isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/api/predictions/history`, { headers });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.warn("Could not fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, token]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/predictions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const exportHistoryCSV = () => {
    if (history.length === 0) return;
    const headers = ["ID", "Student", "Date", "Score", "Level", "Study (h)", "Attendance %", "Notes"];
    const rows = history.map((h) => [
      h.id,
      `"${h.student_name}"`,
      h.created_at,
      h.predicted_score,
      h.performance_level,
      h.study_hours,
      h.attendance,
      `"${h.notes || ""}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `prediction_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare chart data (chronological)
  const chartData = [...history]
    .reverse()
    .map((item, index) => ({
      index: index + 1,
      name: item.student_name,
      score: item.predicted_score,
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : `#${index + 1}`,
    }));

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <History className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Prediction History & Trajectory
              </h2>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {history.length} Logged
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track historical evaluations, monitor progress trends, and export records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated && onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign in to save records</span>
            </button>
          )}
          {history.length > 0 && (
            <button
              type="button"
              onClick={exportHistoryCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Trajectory Trend Chart */}
      {chartData.length > 1 && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>Performance Trajectory Over Time</span>
            </div>
            <span className="text-[11px] text-slate-400">Scores (0 - 100)</span>
          </div>
          <div className="mt-3 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#88888860" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#88888860" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val}/100`, "Predicted Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History Records List */}
      <div className="mt-6 space-y-3">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <History className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              No saved evaluations yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Use the Single Predictor tab and click "Save to My Profile" to record your progress!
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-lg ${
                    item.predicted_score >= 85
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : item.predicted_score >= 70
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                      : item.predicted_score >= 50
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  }`}
                >
                  {item.predicted_score}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.student_name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.performance_level === "Excellent"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : item.performance_level === "Good"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : item.performance_level === "Average"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {item.performance_level}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Study: {item.study_hours}h</span>
                    <span>•</span>
                    <span>Attendance: {item.attendance}%</span>
                    <span>•</span>
                    <span>Exam: {item.previous_score}</span>
                    <span>•</span>
                    <span>Assign: {item.assignment_score}</span>
                  </div>
                  {item.notes && (
                    <p className="mt-1 text-[11px] text-slate-400 italic">"{item.notes}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {onSelectPrediction && (
                  <button
                    type="button"
                    onClick={() => onSelectPrediction(item)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <span>Load</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    title="Delete record"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
