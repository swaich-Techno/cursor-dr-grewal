"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";
import { getProduct } from "@/lib/catalog";
import { useDemo, type CustomerEnquiry, type CustomerStatus } from "@/lib/demo-store";
import { fill, useI18n, type MessageKey } from "@/lib/i18n";
import { formatBytes, validatePrescriptionFile } from "@/lib/prescription";
import { btnPrimary, btnSecondary, FieldError, QuantityControl } from "@/components/ui";
import { WhatsAppButton } from "@/components/SiteChrome";

const animals = [
  { value: "Cattle", key: "animalCattleOnly" },
  { value: "Buffalo", key: "animalBuffalo" },
  { value: "Dog", key: "animalDog" },
  { value: "Horse", key: "animalHorse" },
  { value: "Other", key: "animalOther" },
] as const;

function validContact(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function PageIntro({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="mb-6">
      <div className="accent-bar mb-3" />
      <h1 className="text-3xl font-extrabold tracking-tight text-[#0e4d28]">{title}</h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#3e4c45]">{lede}</p>
    </header>
  );
}

export function BasketView() {
  const { t } = useI18n();
  const { basket, catalogue, setQuantity, removeFromBasket } = useDemo();
  const lines = basket
    .map((line) => ({ ...line, product: catalogue.find((item) => item.slug === line.slug) }))
    .filter((line) => line.product);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6">
      <PageIntro title={t("basketTitle")} lede={t("footerRefresh")} />
      {lines.length === 0 ? (
        <div className="rounded-xl border border-[#e6eee8] bg-[#f7faf7] p-5">
          <p>{t("basketEmpty")}</p>
          <Link href="/products" className={`${btnPrimary} mt-4`}>
            {t("basketBrowse")}
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {lines.map((line) => (
            <li key={line.slug} className="flex flex-col gap-3 rounded-xl border border-[#e6eee8] p-3 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 bg-[#fafafa]">
                <Image src={line.product!.image} alt={line.product!.imageAlt} fill className="object-contain p-1" sizes="80px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{line.product!.name}</p>
                <p className="text-sm text-[#3e4c45]">{t("price")}</p>
              </div>
              <QuantityControl
                value={line.quantity}
                label={fill(t("basketQty"), { name: line.product!.name })}
                decreaseLabel={t("detailDecrease")}
                increaseLabel={t("detailIncrease")}
                onChange={(value) => {
                  if (!Number.isFinite(value)) return;
                  setQuantity(line.slug, value);
                }}
              />
              <button type="button" className={btnSecondary} onClick={() => removeFromBasket(line.slug)}>
                {t("basketRemove")}
              </button>
            </li>
          ))}
        </ul>
      )}
      {lines.length > 0 ? (
        <Link href="/enquiry" className={`${btnPrimary} mt-5`}>
          {t("basketCheckout")}
        </Link>
      ) : null}
    </div>
  );
}

export function EnquiryForm() {
  const { t } = useI18n();
  const params = useSearchParams();
  const { basket, catalogue, submitCustomer } = useDemo();
  const asked = getProduct(params.get("ask") ?? "");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [animal, setAnimal] = useState("");
  const [message, setMessage] = useState(asked ? fill(t("enquiryPrefill"), { name: asked.name }) : "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<CustomerEnquiry | null>(null);
  const nameId = useId();
  const contactId = useId();
  const animalId = useId();
  const messageId = useId();

  const lines = basket
    .map((line) => catalogue.find((item) => item.slug === line.slug))
    .filter((item) => item)
    .map((item) => ({
      slug: item!.slug,
      name: item!.name,
      quantity: basket.find((line) => line.slug === item!.slug)?.quantity ?? 1,
    }));

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = t("enquiryNameError");
    if (!validContact(contact)) next.contact = t("enquiryContactError");
    if (!animal) next.animal = t("enquiryAnimalError");
    if (message.trim().length < 5) next.message = t("enquiryMessageError");
    setErrors(next);
    if (Object.keys(next).length) return;
    const id = submitCustomer({
      name: name.trim(),
      contact: contact.trim(),
      animal,
      message: message.trim(),
      items: lines,
      askedName: asked?.name,
    });
    setDone({
      id,
      sample: false,
      createdLabel: "",
      name: name.trim(),
      contact: contact.trim(),
      animal,
      message: message.trim(),
      items: lines,
      askedName: asked?.name,
      status: "new",
      staffNote: "",
    });
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6">
        <PageIntro title={t("enquirySuccess")} lede={fill(t("enquirySuccessBody"), { id: done.id })} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/payment?request=${done.id}`} className={btnPrimary}>
            {t("enquiryPayment")}
          </Link>
          <Link href="/admin" className={btnSecondary}>
            {t("adminDemo")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6">
      <PageIntro title={t("enquiryTitle")} lede={t("enquiryLede")} />
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <div>
          <label htmlFor={nameId} className="mb-1 block text-sm font-semibold">
            {t("enquiryName")} <span className="text-[#8d2b16]">*</span>
          </label>
          <input id={nameId} className="min-h-11 w-full rounded-lg border border-[#d5e0d8] px-3 text-base" value={name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${nameId}-error` : undefined} onChange={(event) => setName(event.target.value)} />
          <FieldError id={`${nameId}-error`}>{errors.name}</FieldError>
        </div>
        <div>
          <label htmlFor={contactId} className="mb-1 block text-sm font-semibold">
            {t("enquiryContact")} <span className="text-[#8d2b16]">*</span>
          </label>
          <input id={contactId} className="min-h-11 w-full rounded-lg border border-[#d5e0d8] px-3 text-base" value={contact} aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? `${contactId}-error` : undefined} onChange={(event) => setContact(event.target.value)} />
          <FieldError id={`${contactId}-error`}>{errors.contact}</FieldError>
        </div>
        <div>
          <label htmlFor={animalId} className="mb-1 block text-sm font-semibold">
            {t("enquiryAnimal")} <span className="text-[#8d2b16]">*</span>
          </label>
          <select id={animalId} className="min-h-11 w-full rounded-lg border border-[#d5e0d8] bg-white px-3 text-base" value={animal} aria-invalid={Boolean(errors.animal)} aria-describedby={errors.animal ? `${animalId}-error` : undefined} onChange={(event) => setAnimal(event.target.value)}>
            <option value="">{t("animalPlaceholder")}</option>
            {animals.map((item) => (
              <option key={item.value} value={item.value}>
                {t(item.key)}
              </option>
            ))}
          </select>
          <FieldError id={`${animalId}-error`}>{errors.animal}</FieldError>
        </div>
        <div>
          <label htmlFor={messageId} className="mb-1 block text-sm font-semibold">
            {t("enquiryMessage")} <span className="text-[#8d2b16]">*</span>
          </label>
          <textarea id={messageId} rows={5} className="w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? `${messageId}-error` : undefined} onChange={(event) => setMessage(event.target.value)} />
          <FieldError id={`${messageId}-error`}>{errors.message}</FieldError>
        </div>
        <section className="rounded-xl border border-[#e6eee8] p-4">
          <h2 className="font-bold text-[#0e4d28]">{t("enquiryItems")}</h2>
          {asked ? (
            <p className="mt-2 text-sm">
              {t("enquiryAsking")}: <span className="font-semibold">{asked.name}</span>
            </p>
          ) : null}
          {lines.length === 0 ? (
            <p className="mt-2 text-sm text-[#3e4c45]">{t("enquiryEmptyItems")}</p>
          ) : (
            <ul className="mt-2 text-sm">
              {lines.map((line) => (
                <li key={line.slug}>
                  {line.name} × {line.quantity}
                </li>
              ))}
            </ul>
          )}
          <Link href="/basket" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[#0e4d28]">
            {t("detailBasket")}
          </Link>
        </section>
        <button type="submit" className={btnPrimary}>
          {t("enquirySubmit")}
        </button>
      </form>
    </div>
  );
}

export function DistributorForm() {
  const { t } = useI18n();
  const { submitDistributor } = useDemo();
  const [values, setValues] = useState({ contactName: "", businessName: "", city: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doneId, setDoneId] = useState("");
  const ids = { contactName: useId(), businessName: useId(), city: useId(), message: useId() };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (values.contactName.trim().length < 2) next.contactName = t("distributorContactError");
    if (values.businessName.trim().length < 2) next.businessName = t("distributorBusinessError");
    if (values.city.trim().length < 2) next.city = t("distributorCityError");
    if (values.message.trim().length < 5) next.message = t("distributorMessageError");
    setErrors(next);
    if (Object.keys(next).length) return;
    setDoneId(
      submitDistributor({
        contactName: values.contactName.trim(),
        businessName: values.businessName.trim(),
        city: values.city.trim(),
        message: values.message.trim(),
      }),
    );
  }

  if (doneId) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6">
        <PageIntro title={t("distributorSuccess")} lede={fill(t("distributorSuccessBody"), { id: doneId })} />
        <Link href="/admin" className={btnPrimary}>
          {t("adminDemo")}
        </Link>
      </div>
    );
  }

  const fields: { key: keyof typeof values; label: MessageKey; multiline?: boolean }[] = [
    { key: "contactName", label: "distributorContact" },
    { key: "businessName", label: "distributorBusiness" },
    { key: "city", label: "distributorCity" },
    { key: "message", label: "distributorMessage", multiline: true },
  ];

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6">
      <PageIntro title={t("distributorTitle")} lede={t("distributorLede")} />
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={ids[field.key]} className="mb-1 block text-sm font-semibold">
              {t(field.label)} <span className="text-[#8d2b16]">*</span>
            </label>
            {field.multiline ? (
              <textarea id={ids[field.key]} rows={5} className="w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={values[field.key]} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `${ids[field.key]}-error` : undefined} onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))} />
            ) : (
              <input id={ids[field.key]} className="min-h-11 w-full rounded-lg border border-[#d5e0d8] px-3 text-base" value={values[field.key]} aria-invalid={Boolean(errors[field.key])} aria-describedby={errors[field.key] ? `${ids[field.key]}-error` : undefined} onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))} />
            )}
            <FieldError id={`${ids[field.key]}-error`}>{errors[field.key]}</FieldError>
          </div>
        ))}
        <button type="submit" className={btnPrimary}>
          {t("distributorSubmit")}
        </button>
      </form>
    </div>
  );
}

export function PrescriptionForm() {
  const { t } = useI18n();
  const { submitPrescription } = useDemo();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [animal, setAnimal] = useState("");
  const [note, setNote] = useState("");
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doneId, setDoneId] = useState("");
  const nameId = useId();
  const contactId = useId();
  const animalId = useId();
  const fileId = useId();
  const noteId = useId();

  function chooseFile(file: File | undefined) {
    if (!file) {
      setFileMeta(null);
      return;
    }
    const problem = validatePrescriptionFile(file);
    if (problem === "type") {
      setErrors((prev) => ({ ...prev, file: t("prescriptionType") }));
      setFileMeta(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (problem === "empty") {
      setErrors((prev) => ({ ...prev, file: t("prescriptionEmpty") }));
      setFileMeta(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (problem === "size") {
      setErrors((prev) => ({ ...prev, file: t("prescriptionSize") }));
      setFileMeta(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setErrors((prev) => ({ ...prev, file: "" }));
    setFileMeta({ name: file.name, size: file.size });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = t("enquiryNameError");
    if (!validContact(contact)) next.contact = t("enquiryContactError");
    if (!animal) next.animal = t("enquiryAnimalError");
    if (!fileMeta) next.file = errors.file || t("prescriptionFileMissing");
    setErrors(next);
    if (Object.keys(next).some((key) => next[key])) return;
    const id = submitPrescription({
      name: name.trim(),
      contact: contact.trim(),
      animal,
      filename: fileMeta!.name,
      sizeBytes: fileMeta!.size,
      note: note.trim(),
    });
    if (fileRef.current) fileRef.current.value = "";
    setFileMeta(null);
    setDoneId(id);
  }

  if (doneId) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6">
        <PageIntro title={t("prescriptionSuccess")} lede={fill(t("prescriptionSuccessBody"), { id: doneId })} />
        <Link href="/admin" className={btnPrimary}>
          {t("adminDemo")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-8 sm:px-6">
      <PageIntro title={t("prescriptionTitle")} lede={t("prescriptionLede")} />
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <div>
          <label htmlFor={nameId} className="mb-1 block text-sm font-semibold">
            {t("enquiryName")} <span className="text-[#8d2b16]">*</span>
          </label>
          <input id={nameId} className="min-h-11 w-full rounded-lg border border-[#d5e0d8] px-3 text-base" value={name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${nameId}-error` : undefined} onChange={(event) => setName(event.target.value)} />
          <FieldError id={`${nameId}-error`}>{errors.name}</FieldError>
        </div>
        <div>
          <label htmlFor={contactId} className="mb-1 block text-sm font-semibold">
            {t("enquiryContact")} <span className="text-[#8d2b16]">*</span>
          </label>
          <input id={contactId} className="min-h-11 w-full rounded-lg border border-[#d5e0d8] px-3 text-base" value={contact} aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? `${contactId}-error` : undefined} onChange={(event) => setContact(event.target.value)} />
          <FieldError id={`${contactId}-error`}>{errors.contact}</FieldError>
        </div>
        <div>
          <label htmlFor={animalId} className="mb-1 block text-sm font-semibold">
            {t("enquiryAnimal")} <span className="text-[#8d2b16]">*</span>
          </label>
          <select id={animalId} className="min-h-11 w-full rounded-lg border border-[#d5e0d8] bg-white px-3 text-base" value={animal} aria-invalid={Boolean(errors.animal)} aria-describedby={errors.animal ? `${animalId}-error` : undefined} onChange={(event) => setAnimal(event.target.value)}>
            <option value="">{t("animalPlaceholder")}</option>
            {animals.map((item) => (
              <option key={item.value} value={item.value}>
                {t(item.key)}
              </option>
            ))}
          </select>
          <FieldError id={`${animalId}-error`}>{errors.animal}</FieldError>
        </div>
        <div>
          <label htmlFor={fileId} className="mb-1 block text-sm font-semibold">
            {t("prescriptionFile")} <span className="text-[#8d2b16]">*</span>
          </label>
          <input
            ref={fileRef}
            id={fileId}
            type="file"
            accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
            className="block w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-[#f4f7f4] file:px-3 file:font-semibold file:text-[#0e4d28]"
            aria-invalid={Boolean(errors.file)}
            aria-describedby={`${fileId}-help ${errors.file ? `${fileId}-error` : ""}`}
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />
          <p id={`${fileId}-help`} className="mt-1 text-sm text-[#3e4c45]">
            {t("prescriptionFileHelp")}
          </p>
          <FieldError id={`${fileId}-error`}>{errors.file}</FieldError>
          {fileMeta ? (
            <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold">
                {fileMeta.name} ({formatBytes(fileMeta.size)})
              </span>
              <button
                type="button"
                className="min-h-11 font-semibold text-[#0e4d28] underline"
                onClick={() => {
                  setFileMeta(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                {t("prescriptionRemove")}
              </button>
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={noteId} className="mb-1 block text-sm font-semibold">
            {t("prescriptionNote")}
          </label>
          <textarea id={noteId} rows={4} className="w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={note} onChange={(event) => setNote(event.target.value)} />
        </div>
        <button type="submit" className={btnPrimary}>
          {t("prescriptionSubmit")}
        </button>
      </form>
    </div>
  );
}

const statusKey: Record<CustomerStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "statusReview",
  "needs-info": "statusNeeds",
  approved: "statusApproved",
  "quote-ready": "statusQuote",
  "payment-simulated": "statusPaid",
};

function completedSteps(status: CustomerStatus) {
  if (status === "new" || status === "in-review" || status === "needs-info") return 1;
  if (status === "approved") return 2;
  if (status === "quote-ready") return 3;
  return 4;
}

export function PaymentDemo() {
  const { t } = useI18n();
  const params = useSearchParams();
  const { customers, updateCustomer } = useDemo();
  const requested = params.get("request");
  const current = customers.find((item) => item.id === requested) ?? null;
  const steps = [t("paymentStepRequest"), t("paymentStepReview"), t("paymentStepQuote"), t("paymentStepPay")];

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6">
      <PageIntro title={t("paymentTitle")} lede={t("paymentLede")} />
      <p className="mb-4 inline-flex rounded-md bg-[#fbf6ea] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[#6a5a32]">
        {t("paymentSimulated")}
      </p>
      {!current ? (
        <p className="rounded-xl border border-[#e6eee8] bg-[#f7faf7] p-4">{t("paymentNoRequest")}</p>
      ) : (
        <article className="rounded-xl border border-[#e6eee8] p-4">
          <h2 className="text-xl font-bold text-[#0e4d28]">
            {current.id} · {current.name}
          </h2>
          <p className="mt-1 text-sm text-[#3e4c45]">
            {t("adminStatus")}: {t(statusKey[current.status])}
          </p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {steps.map((step, index) => {
              const done = index < completedSteps(current.status);
              const active = index === completedSteps(current.status);
              return (
                <li key={step} className={`rounded-lg border p-3 text-sm ${done ? "border-[#0f5c32] bg-[#f3faf5]" : "border-[#e6eee8]"}`}>
                  <span className="block text-xs font-bold text-[#0e4d28]">
                    {index + 1}. {done ? "✓" : active ? "●" : "○"}
                  </span>
                  {step}
                </li>
              );
            })}
          </ol>
          {current.status === "needs-info" ? (
            <p className="mt-4 rounded-lg bg-[#fbf6ea] p-3 text-sm">
              {t("paymentNeeds")} {current.staffNote}
            </p>
          ) : null}
          {current.status === "new" || current.status === "in-review" ? <p className="mt-4 text-sm">{t("paymentWaiting")}</p> : null}
          {current.status === "approved" ? <p className="mt-4 text-sm">{t("paymentApproved")}</p> : null}
          {current.status === "quote-ready" ? (
            <div className="mt-4">
              <p className="text-sm leading-relaxed">{t("paymentQuote")}</p>
              <button type="button" className={`${btnPrimary} mt-3`} onClick={() => updateCustomer(current.id, { status: "payment-simulated" })}>
                {t("paymentSimulate")}
              </button>
            </div>
          ) : null}
          {current.status === "payment-simulated" ? <p className="mt-4 text-sm font-semibold text-[#0e4d28]">{t("paymentDone")}</p> : null}
          <Link href="/admin" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#0e4d28]">
            {t("adminDemo")}
          </Link>
        </article>
      )}
      <section className="mt-6">
        <h2 className="font-bold text-[#0e4d28]">{t("paymentChoose")}</h2>
        <ul className="mt-2 grid gap-2">
          {customers.map((item) => (
            <li key={item.id}>
              <Link href={`/payment?request=${item.id}`} className="flex min-h-11 items-center justify-between rounded-lg border border-[#e6eee8] px-3 py-2 text-sm hover:border-[#b7d0be]">
                <span>
                  {item.id} · {item.name}
                  {item.sample ? ` · ${t("adminSample")}` : ""}
                </span>
                <span>{t(statusKey[item.status])}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function SupportView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6">
      <PageIntro title={t("supportTitle")} lede={t("supportLede")} />
      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] p-5">
          <h2 className="text-xl font-bold text-[#0e4d28]">{t("supportCustomer")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3e4c45]">{t("supportCustomerBody")}</p>
          <Link href="/enquiry" className={`${btnPrimary} mt-auto self-start pt-4`}>
            {t("supportContact")}
          </Link>
        </article>
        <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] p-5">
          <h2 className="text-xl font-bold text-[#0e4d28]">{t("supportPrescription")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3e4c45]">{t("supportPrescriptionBody")}</p>
          <Link href="/prescription" className={`${btnSecondary} mt-auto self-start pt-4`}>
            {t("supportUpload")}
          </Link>
        </article>
        <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] p-5">
          <h2 className="text-xl font-bold text-[#0e4d28]">{t("supportWhatsapp")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3e4c45]">{t("supportWhatsappBody")}</p>
          <WhatsAppButton className={`${btnSecondary} mt-auto self-start pt-4`} />
        </article>
        <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] p-5">
          <h2 className="text-xl font-bold text-[#0e4d28]">{t("supportDistributor")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3e4c45]">{t("supportDistributorBody")}</p>
          <Link href="/distributor" className={`${btnSecondary} mt-auto self-start pt-4`}>
            {t("footerDistributor")}
          </Link>
        </article>
        <article className="flex h-full flex-col rounded-xl border border-[#e6eee8] p-5 md:col-span-2">
          <h2 className="text-xl font-bold text-[#0e4d28]">{t("supportPayment")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3e4c45]">{t("supportPaymentBody")}</p>
          <Link href="/payment" className={`${btnSecondary} mt-auto self-start pt-4`}>
            {t("footerPayment")}
          </Link>
        </article>
      </div>
    </div>
  );
}

export function AboutView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-8 sm:px-6">
      <PageIntro title={t("aboutKicker")} lede={t("aboutPageLede")} />
      <div className="grid gap-4 text-base leading-relaxed text-[#1c2420]">
        <p>
          {t("aboutTitle")}. {t("aboutBody")}.
        </p>
        <p>{t("aboutMentor")}</p>
        <p>{t("footerAddress")}</p>
        <p className="text-sm text-[#3e4c45]">{t("footerAddressNote")}</p>
        <p>{t("aboutCatalogue")}</p>
        <p>{t("aboutPrescription")}</p>
        <p className="text-sm text-[#6a5a32]">{t("detailEnglish")}</p>
      </div>
    </div>
  );
}
