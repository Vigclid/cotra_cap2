"use client";

import { useEffect, useState } from "react";
import { Download, LoaderCircle, X } from "lucide-react";
import type { AiEvaluation, AiEvaluationReport, AnalyticsStudent } from "@/types/api";
import { api, apiErrorMessage } from "@/utils/apiClient";
import { ErrorBox } from "./ui";

const SECTIONS: {
  key: keyof AiEvaluation;
  title: string;
  emoji: string;
  tone: string;
  ordered?: boolean;
}[] = [
  {
    key: "strengths",
    title: "Điểm mạnh",
    emoji: "🌟",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100",
  },
  {
    key: "weaknesses",
    title: "Điểm yếu",
    emoji: "⚠️",
    tone: "border-orange-200 bg-orange-50 text-orange-950 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100",
  },
  {
    key: "focusAreas",
    title: "Trọng tâm ôn tập",
    emoji: "🎯",
    tone: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100",
  },
  {
    key: "actionPlan",
    title: "Kế hoạch hành động",
    emoji: "🚀",
    tone: "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100",
    ordered: true,
  },
];

const PRINT_COLORS: Record<keyof AiEvaluation, { bg: string; fg: string; border: string }> = {
  strengths: { bg: "#ecfdf5", fg: "#065f46", border: "#a7f3d0" },
  weaknesses: { bg: "#fff7ed", fg: "#9a3412", border: "#fed7aa" },
  focusAreas: { bg: "#f0f9ff", fg: "#075985", border: "#bae6fd" },
  actionPlan: { bg: "#f5f3ff", fg: "#5b21b6", border: "#ddd6fe" },
};

export function AiEvaluationModal({ student, onClose }: { student: AnalyticsStudent; onClose: () => void }) {
  const [report, setReport] = useState<AiEvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    setReport(null);
    setPdfError(null);
    api.teacher
      .evaluate(student.id, ctrl.signal)
      .then((next) => {
        if (!ctrl.signal.aborted) setReport(next);
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [student.id, attempt]);

  const downloadPdf = () => {
    if (!report) return;
    setPdfError(null);
    const popup = window.open("", "_blank", "width=860,height=960");
    if (!popup) {
      setPdfError("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup rồi bấm lại, sau đó chọn Save as PDF.");
      return;
    }
    popup.document.open();
    popup.document.write(reportHtml(student, report));
    popup.document.close();
    window.setTimeout(() => {
      popup.focus();
      popup.print();
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-report-title"
      aria-busy={loading}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-surface p-6 shadow-pop sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-violet-500">Báo cáo năng lực học sinh</p>
            <h2 id="ai-report-title" className="mt-1 text-2xl font-black">
              {student.levelEmoji} {student.fullName}
            </h2>
            <p className="mt-1 text-sm font-semibold text-ink/55">
              Cấp {student.level + 1} · {student.levelName} · {student.exp} EXP
              {report ? ` · dựa trên ${report.draftsUsed} bản nháp` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng báo cáo" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-14 text-center" role="status">
            <LoaderCircle className="h-10 w-10 animate-spin text-violet-500" />
            <p className="text-lg font-black">AI đang phân tích dữ liệu học sinh...</p>
            <p className="max-w-sm text-sm font-semibold text-ink/55">Cô Cú đang đọc vài bản nháp gần nhất. Thường mất khoảng vài giây.</p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 space-y-4">
            <ErrorBox message={error} />
            <div className="flex justify-end">
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="rounded-full bg-violet-500 px-5 py-2.5 font-extrabold text-white">
                Thử lại
              </button>
            </div>
          </div>
        )}

        {!loading && report && (
          <div className="mt-5 space-y-3">
            {report.source === "demo" && (
              <p className="rounded-2xl bg-lemon-pastel px-4 py-3 text-sm font-bold text-amber-800 dark:text-amber-200">
                Máy chủ chưa có khoá AI, nên đây là nhận xét sơ bộ từ số bản nháp và độ dài câu trả lời. Thêm GEMINI_API_KEY vào backend để có phân tích đầy đủ.
              </p>
            )}
            {SECTIONS.map((section) => (
              <section key={section.key} className={`rounded-2xl border-2 px-4 py-4 ${section.tone}`}>
                <h3 className="font-black">
                  {section.emoji} {section.title}
                </h3>
                <ItemList items={report.evaluation[section.key]} ordered={section.ordered} />
              </section>
            ))}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {pdfError && <p className="mr-auto text-sm font-bold text-red-600">{pdfError}</p>}
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-extrabold text-cream"
              >
                <Download className="h-4 w-4" />
                Tải báo cáo (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  if (items.length === 0) {
    return <p className="mt-2 text-sm font-semibold opacity-70">Chưa có ý nhận xét cho mục này.</p>;
  }
  const List = ordered ? "ol" : "ul";
  return (
    <List className={`mt-2 space-y-1.5 text-sm font-semibold ${ordered ? "list-decimal pl-5" : "list-disc pl-5"}`}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </List>
  );
}

function reportHtml(student: AnalyticsStudent, report: AiEvaluationReport): string {
  const when = new Date().toLocaleString("vi-VN");
  const sections = SECTIONS.map((section) => {
    const color = PRINT_COLORS[section.key];
    const items = report.evaluation[section.key];
    const list = items.length
      ? `<${section.ordered ? "ol" : "ul"}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${section.ordered ? "ol" : "ul"}>`
      : "<p>Chưa có ý nhận xét cho mục này.</p>";
    return `<section style="margin:0 0 14px;padding:14px 16px;border:1px solid ${color.border};border-radius:16px;background:${color.bg};color:${color.fg}">
      <h2 style="margin:0 0 8px;font-size:16px">${section.emoji} ${escapeHtml(section.title)}</h2>
      ${list}
    </section>`;
  }).join("");

  const note =
    report.source === "demo"
      ? `<p style="padding:10px 12px;border-radius:12px;background:#fef9c3;color:#92400e;font-size:13px">Bản nhận xét sơ bộ vì máy chủ chưa cấu hình khoá AI.</p>`
      : "";

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Báo cáo năng lực - ${escapeHtml(student.fullName)}</title>
  <style>
    body { margin: 32px; font-family: "Segoe UI", sans-serif; color: #1f2937; }
    h1 { margin: 0 0 4px; font-size: 26px; }
    ul, ol { margin: 0; padding-left: 18px; }
    li { margin: 4px 0; }
  </style>
</head>
<body>
  <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7c3aed;font-weight:700">Trạm Sạc Ngữ Văn</p>
  <h1>Báo cáo năng lực học sinh</h1>
  <p style="margin:0 0 16px;color:#4b5563">${escapeHtml(student.fullName)} · Cấp ${student.level + 1} · ${escapeHtml(student.levelName)} · ${student.exp} EXP<br/>Dựa trên ${report.draftsUsed} bản nháp · ${escapeHtml(when)}</p>
  ${note}
  ${sections}
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
