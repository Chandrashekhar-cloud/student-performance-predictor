import { useState, useEffect } from "react";
import {
  Cpu,
  Calculator,
  Award,
  CheckCircle2,
  Database,
  BarChart2,
  Activity,
  Sparkles,
} from "lucide-react";

interface ModelStats {
  algorithm: string;
  r2_score: number;
  mae: number;
  training_samples: number;
  intercept: number;
  equation: string;
  features: Array<{
    key: string;
    name: string;
    weight: number;
    impact: string;
  }>;
}

import { API_BASE } from "../lib/api";

export function ModelFormulaVisualizer() {
  const [stats, setStats] = useState<ModelStats | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/model/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.warn("Failed to fetch model stats:", err));
  }, []);

  const features = stats?.features || [
    { key: "study_hours", name: "Study Hours (hrs/day)", weight: 1.9117, impact: "High Positive" },
    { key: "sleep_hours", name: "Sleep Hours (hrs/day)", weight: 0.5529, impact: "Moderate Positive" },
    { key: "assignment_score", name: "Assignment Score (/100)", weight: 0.3333, impact: "High Positive" },
    { key: "previous_score", name: "Previous Exam Score (/100)", weight: 0.3169, impact: "High Positive" },
    { key: "attendance", name: "Attendance (%)", weight: 0.1402, impact: "Moderate Positive" },
  ];

  const maxWeight = Math.max(...features.map((f) => Math.abs(f.weight)), 2.0);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Mathematical Model Transparency
            </h2>
            <span className="rounded-md bg-cyan-100 px-2 py-0.5 text-[11px] font-semibold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
              OLS Regression
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Full transparency into the learned machine learning weights, bias intercept, and statistical metrics.
          </p>
        </div>
      </div>

      {/* Model Spec Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Variance Explained (R²)
          </span>
          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats?.r2_score ? (stats.r2_score * 100).toFixed(1) : "97.1"}%
          </p>
          <span className="text-[10px] text-slate-400">R² = {stats?.r2_score || "0.9712"}</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Mean Absolute Error (MAE)
          </span>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ±{stats?.mae || "1.84"}
          </p>
          <span className="text-[10px] text-slate-400">Average error in marks</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Training Records
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {stats?.training_samples || "1,000"}
          </p>
          <span className="text-[10px] text-slate-400">80/20 train-test split</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Bias Intercept (β₀)
          </span>
          <p className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats?.intercept || "-2.535"}
          </p>
          <span className="text-[10px] text-slate-400">Baseline intercept</span>
        </div>
      </div>

      {/* Regression Formula Display */}
      <div className="mt-6 rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-5 text-white shadow-md">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
          Learned Hypothesis Function
        </span>
        <div className="mt-2 font-mono text-xs leading-relaxed text-indigo-100 sm:text-sm">
          Ŷ = {stats?.intercept || "-2.535"} + (1.9117 × Study) + (0.1402 × Attendance) + (0.3169 × Previous) + (0.3333 × Assignment) + (0.5529 × Sleep)
        </div>
        <p className="mt-2 text-[11px] text-indigo-300/80">
          Clamped at [0, 100] marks to guarantee mathematically sound and valid percentage predictions.
        </p>
      </div>

      {/* Feature Weights Visualizer */}
      <div className="mt-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Feature Coefficient & Importance Ranking
        </h3>
        <div className="space-y-3">
          {features.map((f) => {
            const barWidth = Math.min(100, Math.round((Math.abs(f.weight) / maxWeight) * 100));
            return (
              <div
                key={f.key}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{f.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      β = {f.weight > 0 ? `+${f.weight.toFixed(4)}` : f.weight.toFixed(4)}
                    </span>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {f.impact}
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
