"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Check, Copy, LoaderCircle, TriangleAlert } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-surface p-5 shadow-soft sm:p-6 ${className}`}>{children}</div>;
}

export function BouncyButton({
  children,
  loading = false,
  disabled,
  className = "",
  icon,
  loadingText,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  loadingText?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  const idle = !loading && !disabled;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-lg font-extrabold text-white shadow-soft transition duration-300 ease-bounce hover:-translate-y-1 hover:scale-105 hover:shadow-pop active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 ${className}`}
    >
      {loading ? (
        <LoaderCircle className="h-5 w-5 animate-spin" />
      ) : (
        <span className={idle ? "group-hover:animate-wiggle" : ""}>{icon}</span>
      )}
      {loading ? loadingText ?? children : children}
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface/80 px-3 py-1 text-xs font-bold text-ink/60 shadow-sm transition duration-300 ease-bounce hover:-translate-y-0.5 hover:text-ink"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Đã chép" : "Sao chép"}
    </button>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex animate-pop-in items-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
      <TriangleAlert className="h-5 w-5 shrink-0" /> {message}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="rounded-full bg-lemon-pastel px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
      DEMO
    </span>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => <h2 className="mb-3 mt-6 text-2xl font-extrabold text-sky-600 dark:text-sky-300">{children}</h2>,
  h2: ({ children }) => <h3 className="mb-3 mt-6 text-xl font-extrabold text-sky-600 dark:text-sky-300">{children}</h3>,
  h3: ({ children }) => (
    <h3 className="mb-3 mt-6 rounded-2xl bg-sky-pastel px-4 py-2 text-lg font-extrabold text-sky-800 first:mt-0 dark:text-sky-200">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-4 border-l-4 border-pink-300 pl-3 text-base font-extrabold text-pink-600 dark:text-pink-300">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 space-y-1.5 pl-5 [&_ul]:mt-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1.5 pl-6">{children}</ol>,
  li: ({ children }) => (
    <li className="relative leading-relaxed before:absolute before:-left-4 before:text-sky-400 before:content-['•']">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="font-extrabold">{children}</strong>,
  em: ({ children }) => <em className="opacity-80">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-2xl bg-lemon-pastel px-4 py-1 text-sm text-amber-800 dark:text-amber-200">
      {children}
    </blockquote>
  ),
  code: ({ children }) => <code className="rounded bg-pink-pastel px-1.5 py-0.5 text-sm">{children}</code>,
};

export function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>;
}
