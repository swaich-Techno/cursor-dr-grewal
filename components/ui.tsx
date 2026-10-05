"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0f5c32] px-4 text-[15px] font-semibold text-white hover:bg-[#0c4a28] disabled:cursor-not-allowed disabled:opacity-60";

export const btnSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c5d5c9] bg-white px-4 text-[15px] font-semibold text-[#0e4d28] hover:bg-[#f4f7f4]";

export const btnQuiet =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-[#0e4d28] underline-offset-4 hover:underline";

export const fieldClass =
  "min-h-11 w-full rounded-lg border border-[#d5e0d8] bg-white px-3 text-base text-[#1c2420]";

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-sm text-[#8d2b16]">
      {children}
    </p>
  );
}

export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = ref.current;
    const focusable = node?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((item) => !item.hasAttribute("disabled"));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous.current?.focus();
    };
  }, [open]);

  return ref;
}

export function Dialog({
  open,
  title,
  onClose,
  closeLabel,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}) {
  const ref = useDialog(open, onClose);
  const titleId = useId();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-[#102018]/50"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-bold text-[#0e4d28]">
            {title}
          </h2>
          <button type="button" className={`${btnQuiet} min-w-11`} aria-label={closeLabel} onClick={onClose}>
            ×
          </button>
        </div>
        <div className="mt-3 text-[15px] leading-relaxed text-[#3e4c45]">{children}</div>
      </div>
    </div>
  );
}

export function QuantityControl({
  value,
  label,
  onChange,
  decreaseLabel,
  increaseLabel,
}: {
  value: number;
  label: string;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const id = useId();
  return (
    <div className="inline-flex items-center rounded-lg border border-[#d5e0d8]">
      <button
        type="button"
        className="min-h-11 min-w-11 font-semibold text-[#0e4d28]"
        aria-label={decreaseLabel}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        className="h-11 w-12 border-x border-[#d5e0d8] text-center text-base"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <button
        type="button"
        className="min-h-11 min-w-11 font-semibold text-[#0e4d28]"
        aria-label={increaseLabel}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
