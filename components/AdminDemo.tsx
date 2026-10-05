"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useDemo,
  type CustomerEnquiry,
  type CustomerStatus,
  type DistributorEnquiry,
  type DistributorStatus,
  type PrescriptionRequest,
  type PrescriptionStatus,
} from "@/lib/demo-store";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { formatBytes } from "@/lib/prescription";
import { btnPrimary, btnSecondary } from "@/components/ui";

const customerStatusKey: Record<CustomerStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "statusReview",
  "needs-info": "statusNeeds",
  approved: "statusApproved",
  "quote-ready": "statusQuote",
  "payment-simulated": "statusPaid",
};

const distributorStatusKey: Record<DistributorStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "statusReview",
  "needs-info": "statusNeeds",
  approved: "statusApproved",
};

const prescriptionStatusKey: Record<PrescriptionStatus, MessageKey> = {
  "awaiting-review": "statusAwaiting",
  "needs-info": "statusNeeds",
  accepted: "statusAccepted",
};

export function AdminDemo() {
  const { t } = useI18n();
  const demo = useDemo();
  const [generation, setGeneration] = useState(0);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6">
      <div className="accent-bar mb-3" />
      <h1 className="text-3xl font-extrabold tracking-tight text-[#0e4d28]">{t("adminTitle")}</h1>
      <p className="mt-2 max-w-3xl text-base leading-relaxed text-[#3e4c45]">{t("adminLede")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btnSecondary}
          onClick={() => {
            demo.resetDemo();
            setGeneration((value) => value + 1);
          }}
        >
          {t("adminReset")}
        </button>
        <p className="text-sm text-[#3e4c45]">{t("adminResetNote")}</p>
      </div>

      <div key={generation} className="mt-8 grid gap-10">
        <section>
          <h2 className="text-2xl font-bold text-[#0e4d28]">{t("adminProducts")}</h2>
          <ul className="mt-3 grid gap-4">
            {demo.catalogue.map((product) => (
              <ProductEditor key={product.slug} slug={product.slug} />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#0e4d28]">{t("adminOrders")}</h2>
          <ul className="mt-3 grid gap-3">
            {demo.customers.map((row) => (
              <li key={row.id} className="rounded-xl border border-[#e6eee8] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold">
                    {row.id} · {row.name}
                    {row.sample ? <Sample /> : null}
                  </p>
                  <p className="text-sm font-semibold text-[#0e4d28]">{t(customerStatusKey[row.status])}</p>
                </div>
                <p className="mt-1 text-sm text-[#3e4c45]">
                  {row.animal} · {row.contact}
                </p>
                <Link href={`/payment?request=${row.id}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[#0e4d28]">
                  {t("footerPayment")}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#0e4d28]">{t("adminCustomers")}</h2>
          <ul className="mt-3 grid gap-4">
            {demo.customers.map((row) => (
              <CustomerCard key={row.id} row={row} />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#0e4d28]">{t("adminDistributors")}</h2>
          {demo.distributors.length === 0 ? <p className="mt-3 text-sm">{t("adminEmpty")}</p> : null}
          <ul className="mt-3 grid gap-4">
            {demo.distributors.map((row) => (
              <DistributorCard key={row.id} row={row} />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#0e4d28]">{t("adminPrescriptions")}</h2>
          <ul className="mt-3 grid gap-4">
            {demo.prescriptions.map((row) => (
              <PrescriptionCard key={row.id} row={row} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Sample() {
  const { t } = useI18n();
  return <span className="ml-2 rounded bg-[#fbf6ea] px-2 py-0.5 text-xs font-bold text-[#6a5a32]">{t("adminSample")}</span>;
}

function ProductEditor({ slug }: { slug: string }) {
  const { t } = useI18n();
  const { catalogue, saveProduct } = useDemo();
  const product = catalogue.find((item) => item.slug === slug);
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [detail, setDetail] = useState(product?.detail ?? "");
  const [confirmation, setConfirmation] = useState(product?.confirmation ?? "");
  const [saved, setSaved] = useState(false);
  if (!product) return null;

  return (
    <li className="rounded-xl border border-[#e6eee8] p-4">
      <h3 className="text-lg font-bold">{product.name}</h3>
      <label className="mt-3 block text-sm font-semibold" htmlFor={`${slug}-summary`}>
        {t("adminSummary")}
      </label>
      <textarea id={`${slug}-summary`} rows={2} className="mt-1 w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={summary} onChange={(event) => { setSummary(event.target.value); setSaved(false); }} />
      <label className="mt-3 block text-sm font-semibold" htmlFor={`${slug}-detail`}>
        {t("adminDetail")}
      </label>
      <textarea id={`${slug}-detail`} rows={4} className="mt-1 w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={detail} onChange={(event) => { setDetail(event.target.value); setSaved(false); }} />
      <label className="mt-3 block text-sm font-semibold" htmlFor={`${slug}-confirm`}>
        {t("adminConfirmation")}
      </label>
      <textarea id={`${slug}-confirm`} rows={3} className="mt-1 w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setSaved(false); }} />
      <button
        type="button"
        className={`${btnPrimary} mt-3`}
        onClick={() => {
          saveProduct(slug, { summary, detail, confirmation });
          setSaved(true);
        }}
      >
        {t("adminSave")}
      </button>
      <p className="mt-2 min-h-5 text-sm font-semibold text-[#0e4d28]" aria-live="polite">
        {saved ? t("adminSaved") : ""}
      </p>
    </li>
  );
}

function CustomerCard({ row }: { row: CustomerEnquiry }) {
  const { t } = useI18n();
  const { updateCustomer } = useDemo();
  const [note, setNote] = useState(row.staffNote);
  const [error, setError] = useState("");

  function apply(status: CustomerStatus, requireNote = false) {
    if (requireNote && note.trim().length < 3) {
      setError(t("adminNoteError"));
      return;
    }
    setError("");
    updateCustomer(row.id, { status, staffNote: note.trim() });
  }

  return (
    <li className="rounded-xl border border-[#e6eee8] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">
          {row.id} · {row.name}
          {row.sample ? <Sample /> : null}
        </h3>
        <p className="text-sm font-semibold">{t(customerStatusKey[row.status])}</p>
      </div>
      <p className="mt-1 text-sm text-[#3e4c45]">
        {row.createdLabel} · {row.contact} · {row.animal}
      </p>
      <p className="mt-2 text-sm leading-relaxed">{row.message}</p>
      {row.askedName ? <p className="mt-2 text-sm">{t("enquiryAsking")}: {row.askedName}</p> : null}
      {row.items.length > 0 ? (
        <ul className="mt-2 text-sm">
          {row.items.map((item) => (
            <li key={item.slug}>
              {item.name} × {item.quantity}
            </li>
          ))}
        </ul>
      ) : null}
      <label className="mt-3 block text-sm font-semibold" htmlFor={`${row.id}-note`}>
        {t("adminNote")}
      </label>
      <textarea id={`${row.id}-note`} rows={2} className="mt-1 w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={note} onChange={(event) => setNote(event.target.value)} />
      {error ? <p className="mt-1 text-sm text-[#8d2b16]">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btnSecondary} onClick={() => apply("in-review")}>{t("adminReview")}</button>
        <button type="button" className={btnSecondary} onClick={() => apply("needs-info", true)}>{t("adminMore")}</button>
        <button type="button" className={btnSecondary} onClick={() => apply("approved")}>{t("adminApprove")}</button>
        <button type="button" className={btnSecondary} onClick={() => apply("quote-ready")}>{t("adminQuote")}</button>
        <button type="button" className={btnPrimary} onClick={() => apply("payment-simulated")}>{t("adminPaid")}</button>
      </div>
    </li>
  );
}

function DistributorCard({ row }: { row: DistributorEnquiry }) {
  const { t } = useI18n();
  const { updateDistributor } = useDemo();
  const [note, setNote] = useState(row.staffNote);
  const [error, setError] = useState("");

  function apply(status: DistributorStatus, requireNote = false) {
    if (requireNote && note.trim().length < 3) {
      setError(t("adminNoteError"));
      return;
    }
    setError("");
    updateDistributor(row.id, { status, staffNote: note.trim() });
  }

  return (
    <li className="rounded-xl border border-[#e6eee8] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">
          {row.id} · {row.businessName}
          {row.sample ? <Sample /> : null}
        </h3>
        <p className="text-sm font-semibold">{t(distributorStatusKey[row.status])}</p>
      </div>
      <p className="mt-1 text-sm text-[#3e4c45]">
        {row.contactName} · {row.city} · {row.createdLabel}
      </p>
      <p className="mt-2 text-sm leading-relaxed">{row.message}</p>
      <label className="mt-3 block text-sm font-semibold" htmlFor={`${row.id}-note`}>
        {t("adminNote")}
      </label>
      <textarea id={`${row.id}-note`} rows={2} className="mt-1 w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={note} onChange={(event) => setNote(event.target.value)} />
      {error ? <p className="mt-1 text-sm text-[#8d2b16]">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btnSecondary} onClick={() => apply("in-review")}>{t("adminReview")}</button>
        <button type="button" className={btnSecondary} onClick={() => apply("needs-info", true)}>{t("adminMore")}</button>
        <button type="button" className={btnPrimary} onClick={() => apply("approved")}>{t("adminApprove")}</button>
      </div>
    </li>
  );
}

function PrescriptionCard({ row }: { row: PrescriptionRequest }) {
  const { t } = useI18n();
  const { updatePrescription } = useDemo();
  const [note, setNote] = useState(row.staffNote);
  const [error, setError] = useState("");

  function apply(status: PrescriptionStatus, requireNote = false) {
    if (requireNote && note.trim().length < 3) {
      setError(t("adminNoteError"));
      return;
    }
    setError("");
    updatePrescription(row.id, { status, staffNote: note.trim() });
  }

  return (
    <li className="rounded-xl border border-[#e6eee8] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">
          {row.id} · {row.filename}
          {row.sample ? <Sample /> : null}
        </h3>
        <p className="text-sm font-semibold">{t(prescriptionStatusKey[row.status])}</p>
      </div>
      <p className="mt-1 text-sm text-[#3e4c45]">
        {row.name} · {row.contact} · {row.animal} · {formatBytes(row.sizeBytes)}
      </p>
      <p className="mt-2 text-sm">{t("adminFileKept")}</p>
      {row.note ? <p className="mt-2 text-sm leading-relaxed">{row.note}</p> : null}
      <label className="mt-3 block text-sm font-semibold" htmlFor={`${row.id}-note`}>
        {t("adminNote")}
      </label>
      <textarea id={`${row.id}-note`} rows={2} className="mt-1 w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={note} onChange={(event) => setNote(event.target.value)} />
      {error ? <p className="mt-1 text-sm text-[#8d2b16]">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btnSecondary} onClick={() => apply("awaiting-review")}>{t("adminAwaiting")}</button>
        <button type="button" className={btnSecondary} onClick={() => apply("needs-info", true)}>{t("adminMore")}</button>
        <button type="button" className={btnPrimary} onClick={() => apply("accepted")}>{t("adminAccept")}</button>
      </div>
    </li>
  );
}
