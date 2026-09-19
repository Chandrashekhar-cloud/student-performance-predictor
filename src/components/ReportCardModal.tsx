import {
  X,
  Printer,
  Download,
  GraduationCap,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    studentName: string;
    predictedScore: number;
    performanceLevel: string;
    studyHours: number;
    attendance: number;
    previousScore: number;
    assignmentScore: number;
    sleepHours: number;
    message?: string;
  };
}

export function ReportCardModal({ isOpen, onClose, data }: ReportCardModalProps) {
  if (!isOpen) return null;

  const getLetterGrade = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  const getPercentile = (score: number) => {
    if (score >= 90) return "Top 5% of Cohort";
    if (score >= 80) return "Top 15% of Cohort";
    if (score >= 70) return "Top 35% of Cohort";
    if (score >= 50) return "Average 50th Percentile";
    return "Lower Quartile - Intervention Recommended";
  };

  const letterGrade = getLetterGrade(data.predictedScore);
  const percentile = getPercentile(data.predictedScore);
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(
      {
        ...data,
        letterGrade,
        percentile,
        generatedAt: new Date().toISOString(),
        model: "Multiple Linear Regression (OLS)",
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Academic_Forecast_${data.studentName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:p-0 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md print:hidden"
        onClick={onClose}
      />

      {/* Certificate Modal Container */}
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 print:max-h-none print:w-full print:border-none print:shadow-none sm:p-10">
        {/* Floating Actions */}
        <div className="flex items-center justify-end gap-2 print:hidden">
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Certificate Frame */}
        <div className="mt-4 rounded-2xl border-2 border-indigo-100 p-6 dark:border-indigo-950 print:border-slate-300">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-lg font-black tracking-wider text-slate-900 uppercase dark:text-white sm:text-xl">
              Academic Performance Forecast
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Department of Machine Learning Analytics & Predictive Modeling
            </p>
          </div>

          {/* Student Banner */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-y border-slate-200/80 py-4 dark:border-slate-800 sm:flex-row">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Student Name
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-white">
                {data.studentName || "Student Candidate"}
              </p>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Evaluation Date
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{currentDate}</p>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-[10px] font-bold uppercase text-slate-400">Predicted Score</span>
              <p className="mt-1 text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {data.predictedScore}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-[10px] font-bold uppercase text-slate-400">Letter Grade</span>
              <p className="mt-1 text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {letterGrade}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <span className="text-[10px] font-bold uppercase text-slate-400">Performance</span>
              <p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {data.performanceLevel}
              </p>
            </div>
          </div>

          {/* Factor Breakdown Matrix */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluation Factor Matrix
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
              <div className="rounded-xl border border-slate-100 p-2.5 text-center dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Daily Study</span>
                <p className="font-bold text-slate-800 dark:text-white">{data.studyHours} hrs</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 text-center dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Attendance</span>
                <p className="font-bold text-slate-800 dark:text-white">{data.attendance}%</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 text-center dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Prior Exam</span>
                <p className="font-bold text-slate-800 dark:text-white">{data.previousScore}/100</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 text-center dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Assignments</span>
                <p className="font-bold text-slate-800 dark:text-white">{data.assignmentScore}/100</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 text-center dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Sleep Duration</span>
                <p className="font-bold text-slate-800 dark:text-white">{data.sleepHours} hrs</p>
              </div>
            </div>
          </div>

          {/* AI Advisor Assessment */}
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs dark:border-indigo-950 dark:bg-indigo-950/20">
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Predictive Advisor Observation:</span>
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {data.message ||
                "Student shows balanced academic engagement. Maintain consistent laboratory attendance and sleep rhythm leading into the examination window."}
            </p>
            <p className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              Estimated Cohort Percentile: {percentile}
            </p>
          </div>

          {/* Model Signature Badge */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] text-slate-400 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Verified Machine Learning Inference Engine • R² ≈ 0.9712</span>
            </div>
            <span>ID: SP-{Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
