import { useState } from "react";
import {
  Compass,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

interface StudyPlanRoadmapProps {
  score?: number;
  studyHours?: number;
  weakestArea?: string;
}

export function StudyPlanRoadmap({
  score = 75,
  studyHours = 6,
  weakestArea = "Assignments",
}: StudyPlanRoadmapProps) {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    "w1-1": true,
    "w1-2": false,
  });

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const planWeeks = [
    {
      week: "Week 1",
      title: "Foundation & Knowledge Gap Audit",
      tagline: "Pinpoint weak conceptual links and rebuild baseline mastery",
      tasks: [
        { id: "w1-1", text: "Audit previous exam mistakes & construct an error log" },
        { id: "w1-2", text: "Complete 2 foundational chapter review worksheets" },
        { id: "w1-3", text: "Establish a strict 7.5-hour sleep bedtime routine" },
      ],
    },
    {
      week: "Week 2",
      title: "Assignment Fortification & Active Recall",
      tagline: "Target continuous evaluations to secure baseline points",
      tasks: [
        { id: "w2-1", text: "Submit all outstanding and upcoming lab/homework assignments early" },
        { id: "w2-2", text: "Use flashcards / spaced repetition for high-frequency formulas" },
        { id: "w2-3", text: "Form a 2-person study group to cross-examine difficult units" },
      ],
    },
    {
      week: "Week 3",
      title: "High-Yield Timed Mock Testing",
      tagline: "Build test-taking stamina and eradicate exam-day hesitation",
      tasks: [
        { id: "w3-1", text: "Complete 3 full-length timed mock tests under strict exam conditions" },
        { id: "w3-2", text: "Conduct in-depth post-mortem on questions answered incorrectly" },
        { id: "w3-3", text: "Clarify lingering doubts with course instructor during office hours" },
      ],
    },
    {
      week: "Week 4",
      title: "Peak Conditioning & Exam Readiness",
      tagline: "Maintain mental alertness and fine-tune formula retention",
      tasks: [
        { id: "w4-1", text: "Quick-review one-page cheat sheets and high-yield summary sheets" },
        { id: "w4-2", text: "No cramming past 10 PM; stabilize circadian rhythm for exam day" },
        { id: "w4-3", text: "Perform a final mental walk-through of core methodologies" },
      ],
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Personalized 4-Week Study Roadmap
              </h2>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                AI Prescribed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Actionable milestone progression customized for your target score trajectory.
            </p>
          </div>
        </div>

        {/* Target Badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Target className="h-4 w-4" />
          <span>Target Score: {Math.min(100, score + 10)}+ Marks</span>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {planWeeks.map((item, idx) => (
          <div
            key={item.week}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/30"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {item.week}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Phase 0{idx + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {item.tagline}
              </p>

              {/* Task Checklist */}
              <div className="mt-4 space-y-2.5">
                {item.tasks.map((task) => {
                  const isChecked = !!completedTasks[task.id];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="flex w-full items-start gap-2 text-left text-xs text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 transition-colors ${
                          isChecked
                            ? "text-emerald-500"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                      <span className={isChecked ? "line-through opacity-70" : ""}>
                        {task.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Pacing:</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {Math.max(2, Math.round(studyHours))} hrs daily
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
