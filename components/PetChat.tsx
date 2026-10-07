"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { chatCopy, chatFill, matchCatalogue, type ChatLocale } from "@/lib/chat-demo";
import { validateConsultationFile } from "@/lib/consultation-file";
import { useDemo, type ChatTurn } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { btnPrimary, btnSecondary, fieldClass, FieldError, useDialog } from "@/components/ui";

const locales: { id: ChatLocale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "hi", label: "हिं" },
  { id: "pa", label: "ਪੰ" },
];

const animalEnglish = {
  cattle: "Cattle",
  buffalo: "Buffalo",
  dog: "Dog",
  horse: "Horse",
  other: "Other",
} as const;

const timeEnglish = {
  morning: "Morning sample",
  afternoon: "Afternoon sample",
} as const;

let turnSeq = 0;
function turnId() {
  turnSeq += 1;
  return `chat-${Date.now()}-${turnSeq}`;
}

export function PetChat() {
  const demo = useDemo();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const close = () => setOpen(false);
  const ref = useDialog(open, close);
  const chatLocale: ChatLocale = demo.chatLocale ?? (locale === "pa" ? "pa" : "en");
  const copy = chatCopy[chatLocale];

  return (
    <>
      {open ? (
        <button type="button" aria-label={copy.close} className="fixed inset-0 z-40 bg-[#102018]/40" onClick={close} />
      ) : null}
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#0f5c32] text-white shadow-lg ring-2 ring-[#e0b15a]"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={copy.open}
        onClick={() => setOpen((value) => !value)}
      >
        <DogMark />
        <span className="absolute -top-1 right-0 rounded-full bg-[#e0b15a] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#1c2420]">
          {copy.demo}
        </span>
      </button>
      {open ? (
        <div
          ref={ref}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed bottom-24 right-4 z-50 flex max-h-[min(36rem,calc(100dvh-7.5rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-[#d5e0d8] bg-white shadow-xl"
          style={chatLocale === "hi" ? { fontFamily: "var(--font-devanagari), var(--font-manrope), sans-serif" } : undefined}
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#e6eee8] px-3 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#6a5a32]">{copy.demo}</p>
              <h2 id={titleId} className="font-display text-lg text-[#0e4d28]">
                {copy.title}
              </h2>
            </div>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-lg text-xl text-[#0e4d28]" aria-label={copy.close} onClick={close}>
              ×
            </button>
          </div>
          <p className="border-b border-[#e6eee8] px-3 py-2 text-xs leading-relaxed text-[#3e4c45]">{copy.draft}</p>
          <div role="group" aria-label={copy.languages} className="flex gap-2 border-b border-[#e6eee8] px-3 py-2">
            {locales.map((item) => {
              const selected = chatLocale === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  className={`min-h-11 min-w-11 rounded-lg px-3 text-sm font-semibold ${selected ? "bg-[#0f5c32] text-white" : "border border-[#d5e0d8] text-[#0e4d28]"}`}
                  style={
                    item.id === "hi"
                      ? { fontFamily: "var(--font-devanagari), sans-serif" }
                      : item.id === "pa"
                        ? { fontFamily: "var(--font-gurmukhi), sans-serif" }
                        : undefined
                  }
                  onClick={() => demo.setChatLocale(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <ChatSession key={demo.sessionNonce} locale={chatLocale} onClose={close} />
        </div>
      ) : null}
    </>
  );
}

function ChatSession({ locale, onClose }: { locale: ChatLocale; onClose: () => void }) {
  const { catalogue, chat, appendChat } = useDemo();
  const copy = chatCopy[locale];
  const [draft, setDraft] = useState("");
  const [formConcern, setFormConcern] = useState<string | null>(null);
  const inputId = useId();
  const liveId = useId();

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const match = matchCatalogue(text, catalogue);
    const visitor: ChatTurn = { id: turnId(), role: "visitor", text };
    const reply: ChatTurn =
      match.kind === "clarify"
        ? { id: turnId(), role: "assistant", kind: "clarify" }
        : match.kind === "suggest"
          ? { id: turnId(), role: "assistant", kind: "suggest", slug: match.slug }
          : { id: turnId(), role: "assistant", kind: "consult", concern: text };
    appendChat([visitor, reply]);
    setDraft("");
    if (match.kind !== "consult") setFormConcern(null);
  }

  return (
    <>
      <div id={liveId} aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
        <p className="rounded-lg bg-[#f4f7f4] px-3 py-2 text-sm leading-relaxed text-[#1c2420]">{copy.greeting}</p>
        {chat.map((turn) =>
          turn.role === "visitor" ? (
            <p key={turn.id} className="ml-6 rounded-lg bg-[#0f5c32] px-3 py-2 text-sm leading-relaxed text-white">
              {turn.text}
            </p>
          ) : (
            <AssistantTurn
              key={turn.id}
              turn={turn}
              locale={locale}
              onConsult={setFormConcern}
              onClose={onClose}
            />
          ),
        )}
        {formConcern ? (
          <AppointmentForm
            concern={formConcern}
            locale={locale}
            onBooked={(reference) => {
              appendChat([{ id: turnId(), role: "assistant", kind: "booked", reference }]);
              setFormConcern(null);
            }}
          />
        ) : null}
      </div>
      <form className="flex gap-2 border-t border-[#e6eee8] p-3" onSubmit={send}>
        <label className="sr-only" htmlFor={inputId}>
          {copy.placeholder}
        </label>
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.placeholder}
          className={`${fieldClass} min-w-0 flex-1`}
        />
        <button type="submit" className={btnPrimary}>
          {copy.send}
        </button>
      </form>
    </>
  );
}

function AssistantTurn({
  turn,
  locale,
  onConsult,
  onClose,
}: {
  turn: Extract<ChatTurn, { role: "assistant" }>;
  locale: ChatLocale;
  onConsult: (concern: string) => void;
  onClose: () => void;
}) {
  const { catalogue } = useDemo();
  const copy = chatCopy[locale];

  if (turn.kind === "clarify") {
    return <Bubble>{copy.clarify}</Bubble>;
  }

  if (turn.kind === "booked") {
    return <Bubble>{chatFill(copy.booked, { reference: turn.reference })}</Bubble>;
  }

  if (turn.kind === "consult") {
    return (
      <Bubble>
        <p>{copy.consultLead}</p>
        <button type="button" className={`${btnPrimary} mt-2`} onClick={() => onConsult(turn.concern)}>
          {copy.consultAction}
        </button>
      </Bubble>
    );
  }

  const product = catalogue.find((item) => item.slug === turn.slug);
  if (!product) return null;

  return (
    <Bubble>
      <p>{chatFill(copy.suggestLead, { name: product.name })}</p>
      <p className="mt-1">{product.summary}</p>
      <p className="mt-1">{product.notice}</p>
      <p className="mt-1 font-semibold">{copy.price}</p>
      {locale !== "en" ? <p className="mt-1 text-xs text-[#3e4c45]">{copy.englishNote}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <Link href={`/products/${product.slug}`} className={btnPrimary} onClick={onClose}>
          {copy.viewProduct}
        </Link>
        <Link href="/basket" className={btnSecondary} onClick={onClose}>
          {copy.basket}
        </Link>
      </div>
    </Bubble>
  );
}

function Bubble({ children }: { children: ReactNode }) {
  return <div className="mr-6 rounded-lg border border-[#e6eee8] bg-[#fbf6ea] px-3 py-2 text-sm leading-relaxed text-[#1c2420]">{children}</div>;
}

function AppointmentForm({
  concern,
  locale,
  onBooked,
}: {
  concern: string;
  locale: ChatLocale;
  onBooked: (reference: string) => void;
}) {
  const { submitConsultation } = useDemo();
  const copy = chatCopy[locale];
  const base = useId();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [animal, setAnimal] = useState("");
  const [text, setText] = useState(concern);
  const [time, setTime] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onFile(next: File | null) {
    setFile(next);
    if (!next) {
      setErrors((prev) => ({ ...prev, file: "" }));
      return;
    }
    const issue = validateConsultationFile(next);
    setErrors((prev) => ({
      ...prev,
      file: issue === "type" ? copy.fileType : issue === "empty" ? copy.fileEmpty : issue === "size" ? copy.fileSize : "",
    }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = copy.nameError;
    const contactText = contact.trim();
    if (contactText.length < 6 || !(contactText.includes("@") || /\d/.test(contactText))) next.contact = copy.contactError;
    if (!animal) next.animal = copy.animalError;
    if (text.trim().length < 3) next.concern = copy.concernError;
    if (time !== "morning" && time !== "afternoon") next.time = copy.timeError;
    if (file) {
      const issue = validateConsultationFile(file);
      if (issue === "type") next.file = copy.fileType;
      if (issue === "empty") next.file = copy.fileEmpty;
      if (issue === "size") next.file = copy.fileSize;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const animalKey = animal as keyof typeof animalEnglish;
    const reference = submitConsultation({
      name: name.trim(),
      contact: contactText,
      animal: animalEnglish[animalKey],
      concern: text.trim(),
      timeLabel: time === "afternoon" ? timeEnglish.afternoon : timeEnglish.morning,
      filename: file?.name ?? "",
      sizeBytes: file?.size ?? 0,
    });
    onBooked(reference);
  }

  return (
    <form className="grid gap-2 rounded-lg border border-[#d5e0d8] bg-white p-3" onSubmit={submit}>
      <p className="text-sm font-semibold text-[#0e4d28]">{copy.formTitle}</p>
      <label className="text-sm font-semibold" htmlFor={`${base}-name`}>
        {copy.name}
      </label>
      <input id={`${base}-name`} className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${base}-name-error` : undefined} />
      <FieldError id={`${base}-name-error`}>{errors.name}</FieldError>
      <label className="text-sm font-semibold" htmlFor={`${base}-contact`}>
        {copy.contact}
      </label>
      <input id={`${base}-contact`} className={fieldClass} value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="email" aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? `${base}-contact-error` : undefined} />
      <FieldError id={`${base}-contact-error`}>{errors.contact}</FieldError>
      <label className="text-sm font-semibold" htmlFor={`${base}-animal`}>
        {copy.animal}
      </label>
      <select id={`${base}-animal`} className={fieldClass} value={animal} onChange={(event) => setAnimal(event.target.value)} aria-invalid={Boolean(errors.animal)} aria-describedby={errors.animal ? `${base}-animal-error` : undefined}>
        <option value="">{copy.animal}</option>
        {(Object.keys(copy.animals) as (keyof typeof copy.animals)[]).map((key) => (
          <option key={key} value={key}>
            {copy.animals[key]}
          </option>
        ))}
      </select>
      <FieldError id={`${base}-animal-error`}>{errors.animal}</FieldError>
      <label className="text-sm font-semibold" htmlFor={`${base}-concern`}>
        {copy.concern}
      </label>
      <textarea id={`${base}-concern`} rows={2} className={`${fieldClass} py-2`} value={text} onChange={(event) => setText(event.target.value)} aria-invalid={Boolean(errors.concern)} aria-describedby={errors.concern ? `${base}-concern-error` : undefined} />
      <FieldError id={`${base}-concern-error`}>{errors.concern}</FieldError>
      <label className="text-sm font-semibold" htmlFor={`${base}-time`}>
        {copy.time}
      </label>
      <select id={`${base}-time`} className={fieldClass} value={time} onChange={(event) => setTime(event.target.value)} aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? `${base}-time-error` : undefined}>
        <option value="">{copy.time}</option>
        <option value="morning">{copy.morning}</option>
        <option value="afternoon">{copy.afternoon}</option>
      </select>
      <FieldError id={`${base}-time-error`}>{errors.time}</FieldError>
      <label className="text-sm font-semibold" htmlFor={`${base}-file`}>
        {copy.file}
      </label>
      <input
        id={`${base}-file`}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        className="block w-full text-sm"
        aria-invalid={Boolean(errors.file)}
        aria-describedby={`${base}-file-hint${errors.file ? ` ${base}-file-error` : ""}`}
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      <p id={`${base}-file-hint`} className="text-xs leading-relaxed text-[#3e4c45]">{copy.fileHint}</p>
      <FieldError id={`${base}-file-error`}>{errors.file}</FieldError>
      <button type="submit" className={btnPrimary}>
        {copy.submit}
      </button>
    </form>
  );
}

function DogMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
      <circle cx="15" cy="14" r="6" fill="#e0b15a" />
      <circle cx="33" cy="14" r="6" fill="#e0b15a" />
      <circle cx="24" cy="26" r="13" fill="#f7f3ea" />
      <circle cx="19" cy="24" r="1.7" fill="#1c2420" />
      <circle cx="29" cy="24" r="1.7" fill="#1c2420" />
      <ellipse cx="24" cy="29" rx="2.4" ry="1.7" fill="#0f5c32" />
    </svg>
  );
}
