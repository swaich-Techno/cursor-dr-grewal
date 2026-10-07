"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import {
  useDemo,
  type ConsultationRequest,
  type ConsultationStatus,
  type CustomerEnquiry,
  type CustomerStatus,
  type DistributorEnquiry,
  type DistributorStatus,
  type PrescriptionRequest,
  type PrescriptionStatus,
} from "@/lib/demo-store";
import { fill, useI18n, type MessageKey } from "@/lib/i18n";
import { formatBytes } from "@/lib/prescription";
import {
  consultationAwaiting,
  consultationStep,
  customerAwaiting,
  customerStep,
  distributorAwaiting,
  distributorStep,
  prescriptionAwaiting,
  prescriptionStep,
} from "@/lib/workflow";
import { btnPrimary, btnSecondary, Dialog } from "@/components/ui";

type TabId = "products" | "customers" | "distributors" | "prescriptions" | "consultations";

const tabs: { id: TabId; label: MessageKey }[] = [
  { id: "products", label: "adminTabProducts" },
  { id: "customers", label: "adminTabCustomers" },
  { id: "distributors", label: "adminTabDistributors" },
  { id: "prescriptions", label: "adminTabPrescriptions" },
  { id: "consultations", label: "adminTabConsultations" },
];

const customerStatusKey: Record<CustomerStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "statusReview",
  "needs-info": "statusNeeds",
  approved: "statusApproved",
  "quote-ready": "statusQuote",
  "payment-simulated": "statusPaid",
};

const customerActionKey: Record<CustomerStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "adminReview",
  "needs-info": "adminMore",
  approved: "adminApprove",
  "quote-ready": "adminQuote",
  "payment-simulated": "adminPaid",
};

const distributorStatusKey: Record<DistributorStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "statusReview",
  "needs-info": "statusNeeds",
  approved: "statusApproved",
};

const distributorActionKey: Record<DistributorStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "adminReview",
  "needs-info": "adminMore",
  approved: "adminApprove",
};

const prescriptionStatusKey: Record<PrescriptionStatus, MessageKey> = {
  "awaiting-review": "statusAwaiting",
  "needs-info": "statusNeeds",
  accepted: "statusAccepted",
};

const prescriptionActionKey: Record<PrescriptionStatus, MessageKey> = {
  "awaiting-review": "adminMarkAwaiting",
  "needs-info": "adminMore",
  accepted: "adminAccept",
};

const consultationStatusKey: Record<ConsultationStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "statusReview",
  "needs-info": "statusNeeds",
  accepted: "statusAccepted",
};

const consultationActionKey: Record<ConsultationStatus, MessageKey> = {
  new: "statusNew",
  "in-review": "adminReview",
  "needs-info": "adminMore",
  accepted: "adminAccept",
};

export function AdminDemo() {
  const { t } = useI18n();
  const demo = useDemo();
  const [generation, setGeneration] = useState(0);
  const [tab, setTab] = useState<TabId>("products");

  const counts = {
    products: demo.catalogue.length,
    customers: demo.customers.filter((row) => customerAwaiting(row.status)).length,
    distributors: demo.distributors.filter((row) => distributorAwaiting(row.status)).length,
    prescriptions: demo.prescriptions.filter((row) => prescriptionAwaiting(row.status)).length,
    consultations: demo.consultations.filter((row) => consultationAwaiting(row.status)).length,
  };
  const completed = {
    customers: demo.customers.length - counts.customers,
    distributors: demo.distributors.length - counts.distributors,
    prescriptions: demo.prescriptions.length - counts.prescriptions,
    consultations: demo.consultations.length - counts.consultations,
  };

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((item) => item.id === tab);
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setTab(tabs[next].id);
    document.getElementById(`admin-tab-${tabs[next].id}`)?.focus();
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6">
      <div className="accent-bar mb-3" />
      <h1 className="text-3xl font-bold tracking-tight text-[#0e4d28]">{t("adminTitle")}</h1>
      <p className="mt-2 max-w-3xl text-base leading-relaxed text-[#3e4c45]">{t("adminLede")}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btnSecondary}
          onClick={() => {
            demo.resetDemo();
            setGeneration((value) => value + 1);
            setTab("products");
          }}
        >
          {t("adminReset")}
        </button>
        <p className="text-sm text-[#3e4c45]">{t("adminResetNote")}</p>
      </div>

      <div key={generation}>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#3e4c45]">
          {tab === "products" ? (
            <p>{fill(t("catalogueCount"), { count: counts.products })}</p>
          ) : (
            <>
              <p>{fill(t("adminAwaiting"), { count: counts[tab] })}</p>
              <p>{fill(t("adminCompleted"), { count: completed[tab] })}</p>
            </>
          )}
        </div>

        <div role="tablist" aria-label={t("adminTitle")} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" onKeyDown={onTabKey}>
          {tabs.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`admin-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold ${selected ? "border-[#0f5c32] bg-[#0f5c32] text-white" : "border-[#d5e0d8] bg-white text-[#0e4d28]"}`}
                onClick={() => setTab(item.id)}
              >
                <span className="block">{t(item.label)}</span>
                <span className={`mt-0.5 block text-xs font-medium ${selected ? "text-[#e7f0ea]" : "text-[#3e4c45]"}`}>
                  {item.id === "products" ? counts.products : fill(t("adminAwaiting"), { count: counts[item.id] })}
                </span>
              </button>
            );
          })}
        </div>

        <div id={`admin-panel-${tab}`} role="tabpanel" aria-labelledby={`admin-tab-${tab}`} className="mt-4">
          {tab === "products" ? <ProductList /> : null}
          {tab === "customers" ? <CustomerList /> : null}
          {tab === "distributors" ? <DistributorList /> : null}
          {tab === "prescriptions" ? <PrescriptionList /> : null}
          {tab === "consultations" ? <ConsultationList /> : null}
        </div>
      </div>
    </div>
  );
}

function Sample() {
  const { t } = useI18n();
  return <span className="ml-2 rounded bg-[#fbf6ea] px-2 py-0.5 text-xs font-bold text-[#6a5a32]">{t("adminSample")}</span>;
}

function ProductList() {
  const { t } = useI18n();
  const { catalogue } = useDemo();
  const [slug, setSlug] = useState<string | null>(null);

  return (
    <>
      <ul className="divide-y divide-[#e6eee8] rounded-xl border border-[#e6eee8]">
        {catalogue.map((product) => (
          <li key={product.slug} className="flex items-center gap-3 p-3">
            <span className="relative block h-14 w-14 shrink-0 bg-[#fafafa]">
              <Image src={product.image} alt="" fill className="object-contain p-1" sizes="56px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{product.name}</span>
              <span className="block truncate text-sm text-[#3e4c45]">{product.summary}</span>
            </span>
            <button type="button" className={btnSecondary} onClick={() => setSlug(product.slug)}>
              {t("adminEdit")}
            </button>
          </li>
        ))}
      </ul>
      <ProductDialog slug={slug} onClose={() => setSlug(null)} />
    </>
  );
}

function ProductDialog({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const { t } = useI18n();
  const { catalogue } = useDemo();
  const product = catalogue.find((item) => item.slug === slug);

  return (
    <Dialog open={Boolean(product)} title={product?.name ?? t("adminEdit")} closeLabel={t("navClose")} onClose={onClose} wide>
      {product ? <ProductFields key={product.slug} slug={product.slug} /> : null}
    </Dialog>
  );
}

function ProductFields({ slug }: { slug: string }) {
  const { t } = useI18n();
  const { catalogue, saveProduct } = useDemo();
  const product = catalogue.find((item) => item.slug === slug);
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [detail, setDetail] = useState(product?.detail ?? "");
  const [notice, setNotice] = useState(product?.notice ?? "");
  const [confirmation, setConfirmation] = useState(product?.confirmation ?? "");
  const [saved, setSaved] = useState(false);
  if (!product) return null;

  return (
    <div className="grid gap-3 text-[#1c2420]">
      <label className="block text-sm font-semibold" htmlFor={`${slug}-summary`}>
        {t("adminSummary")}
      </label>
      <textarea id={`${slug}-summary`} rows={2} className="w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={summary} onChange={(event) => { setSummary(event.target.value); setSaved(false); }} />
      <label className="block text-sm font-semibold" htmlFor={`${slug}-detail`}>
        {t("adminDetail")}
      </label>
      <textarea id={`${slug}-detail`} rows={4} className="w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={detail} onChange={(event) => { setDetail(event.target.value); setSaved(false); }} />
      <label className="block text-sm font-semibold" htmlFor={`${slug}-notice`}>
        {t("adminCustomerNotice")}
      </label>
      <textarea id={`${slug}-notice`} rows={2} className="w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={notice} onChange={(event) => { setNotice(event.target.value); setSaved(false); }} />
      <label className="block text-sm font-semibold" htmlFor={`${slug}-confirm`}>
        {t("adminConfirmation")}
      </label>
      <textarea id={`${slug}-confirm`} rows={4} className="w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setSaved(false); }} />
      <button
        type="button"
        className={btnPrimary}
        onClick={() => {
          saveProduct(slug, { summary, detail, notice, confirmation });
          setSaved(true);
        }}
      >
        {t("adminSave")}
      </button>
      <p className="min-h-5 text-sm font-semibold text-[#0e4d28]" aria-live="polite">
        {saved ? t("adminSaved") : ""}
      </p>
    </div>
  );
}

function CustomerList() {
  const { t } = useI18n();
  const { customers } = useDemo();
  const [id, setId] = useState<string | null>(null);
  const row = customers.find((item) => item.id === id) ?? null;

  return (
    <>
      {customers.length === 0 ? <p className="text-sm">{t("adminEmpty")}</p> : null}
      <ul className="grid gap-2">
        {customers.map((item) => (
          <li key={item.id}>
            <button type="button" className="grid w-full gap-1 rounded-lg border border-[#e6eee8] p-3 text-left hover:border-[#b7d0be] sm:grid-cols-[7rem_1fr_auto]" onClick={() => setId(item.id)}>
              <span className="font-bold">
                {item.id}
                {item.sample ? <Sample /> : null}
              </span>
              <span>
                <span className="block font-semibold">{item.name}</span>
                <span className="block text-sm text-[#3e4c45]">
                  {item.createdLabel}
                  {item.items.length > 0 ? ` · ${item.items.map((line) => `${line.name} × ${line.quantity}`).join(", ")}` : ""}
                </span>
              </span>
              <span className="text-sm font-semibold text-[#0e4d28]">
                {t(customerStatusKey[item.status])}
                <span className="mt-1 block font-semibold underline">{t("adminOpenDetails")}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(row)} title={row ? `${row.id} · ${row.name}` : t("adminCustomers")} closeLabel={t("navClose")} onClose={() => setId(null)} wide>
        {row ? <CustomerDetail key={row.id} row={row} /> : null}
      </Dialog>
    </>
  );
}

function CustomerDetail({ row }: { row: CustomerEnquiry }) {
  const { t } = useI18n();
  const { updateCustomer } = useDemo();
  const [note, setNote] = useState(row.staffNote);
  const [error, setError] = useState("");
  const step = customerStep(row.status);

  function apply(status: CustomerStatus) {
    if (status === "needs-info" && note.trim().length < 3) {
      setError(t("adminNoteError"));
      return;
    }
    setError("");
    updateCustomer(row.id, { status, staffNote: note.trim() });
  }

  return (
    <div className="grid gap-3 text-[#1c2420]">
      <p className="text-sm font-semibold text-[#0e4d28]">{t(customerStatusKey[row.status])}</p>
      <p className="text-sm text-[#3e4c45]">
        {row.createdLabel} · {row.contact} · {row.animal}
      </p>
      <p className="text-sm leading-relaxed">{row.message}</p>
      {row.askedName ? <p className="text-sm">{t("enquiryAsking")}: {row.askedName}</p> : null}
      {row.items.length > 0 ? (
        <div>
          <p className="text-sm font-semibold">{t("adminItems")}</p>
          <ul className="mt-1 text-sm">
            {row.items.map((item) => (
              <li key={item.slug}>
                {item.name} × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <NoteField id={`${row.id}-note`} value={note} onChange={setNote} />
      {error ? <p className="text-sm text-[#8d2b16]">{error}</p> : null}
      <ActionRow
        next={step.next}
        also={step.also}
        labelFor={(status) => t(customerActionKey[status])}
        onApply={apply}
      />
    </div>
  );
}

function DistributorList() {
  const { t } = useI18n();
  const { distributors } = useDemo();
  const [id, setId] = useState<string | null>(null);
  const row = distributors.find((item) => item.id === id) ?? null;

  return (
    <>
      {distributors.length === 0 ? <p className="text-sm">{t("adminEmpty")}</p> : null}
      <ul className="grid gap-2">
        {distributors.map((item) => (
          <li key={item.id}>
            <button type="button" className="grid w-full gap-1 rounded-lg border border-[#e6eee8] p-3 text-left hover:border-[#b7d0be] sm:grid-cols-[7rem_1fr_auto]" onClick={() => setId(item.id)}>
              <span className="font-bold">
                {item.id}
                {item.sample ? <Sample /> : null}
              </span>
              <span>
                <span className="block font-semibold">{item.businessName}</span>
                <span className="block text-sm text-[#3e4c45]">
                  {item.contactName} · {item.city} · {item.createdLabel}
                </span>
              </span>
              <span className="text-sm font-semibold text-[#0e4d28]">
                {t(distributorStatusKey[item.status])}
                <span className="mt-1 block font-semibold underline">{t("adminOpenDetails")}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(row)} title={row ? `${row.id} · ${row.businessName}` : t("adminDistributors")} closeLabel={t("navClose")} onClose={() => setId(null)} wide>
        {row ? <DistributorDetail key={row.id} row={row} /> : null}
      </Dialog>
    </>
  );
}

function DistributorDetail({ row }: { row: DistributorEnquiry }) {
  const { t } = useI18n();
  const { updateDistributor } = useDemo();
  const [note, setNote] = useState(row.staffNote);
  const [error, setError] = useState("");
  const step = distributorStep(row.status);

  function apply(status: DistributorStatus) {
    if (status === "needs-info" && note.trim().length < 3) {
      setError(t("adminNoteError"));
      return;
    }
    setError("");
    updateDistributor(row.id, { status, staffNote: note.trim() });
  }

  return (
    <div className="grid gap-3 text-[#1c2420]">
      <p className="text-sm font-semibold text-[#0e4d28]">{t(distributorStatusKey[row.status])}</p>
      <p className="text-sm text-[#3e4c45]">
        {row.contactName} · {row.city} · {row.createdLabel}
      </p>
      <p className="text-sm leading-relaxed">{row.message}</p>
      <NoteField id={`${row.id}-note`} value={note} onChange={setNote} />
      {error ? <p className="text-sm text-[#8d2b16]">{error}</p> : null}
      <ActionRow next={step.next} also={step.also} labelFor={(status) => t(distributorActionKey[status])} onApply={apply} />
    </div>
  );
}

function PrescriptionList() {
  const { t } = useI18n();
  const { prescriptions } = useDemo();
  const [id, setId] = useState<string | null>(null);
  const row = prescriptions.find((item) => item.id === id) ?? null;

  return (
    <>
      {prescriptions.length === 0 ? <p className="text-sm">{t("adminEmpty")}</p> : null}
      <ul className="grid gap-2">
        {prescriptions.map((item) => (
          <li key={item.id}>
            <button type="button" className="grid w-full gap-1 rounded-lg border border-[#e6eee8] p-3 text-left hover:border-[#b7d0be] sm:grid-cols-[7rem_1fr_auto]" onClick={() => setId(item.id)}>
              <span className="font-bold">
                {item.id}
                {item.sample ? <Sample /> : null}
              </span>
              <span>
                <span className="block font-semibold">{item.filename}</span>
                <span className="block text-sm text-[#3e4c45]">
                  {item.name} · {item.createdLabel} · {formatBytes(item.sizeBytes)}
                </span>
              </span>
              <span className="text-sm font-semibold text-[#0e4d28]">
                {t(prescriptionStatusKey[item.status])}
                <span className="mt-1 block font-semibold underline">{t("adminOpenDetails")}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(row)} title={row ? `${row.id} · ${row.filename}` : t("adminPrescriptions")} closeLabel={t("navClose")} onClose={() => setId(null)} wide>
        {row ? <PrescriptionDetail key={row.id} row={row} /> : null}
      </Dialog>
    </>
  );
}

function PrescriptionDetail({ row }: { row: PrescriptionRequest }) {
  const { t } = useI18n();
  const { updatePrescription } = useDemo();
  const [note, setNote] = useState(row.staffNote);
  const [error, setError] = useState("");
  const step = prescriptionStep(row.status);

  function apply(status: PrescriptionStatus) {
    if (status === "needs-info" && note.trim().length < 3) {
      setError(t("adminNoteError"));
      return;
    }
    setError("");
    updatePrescription(row.id, { status, staffNote: note.trim() });
  }

  return (
    <div className="grid gap-3 text-[#1c2420]">
      <p className="text-sm font-semibold text-[#0e4d28]">{t(prescriptionStatusKey[row.status])}</p>
      <p className="text-sm text-[#3e4c45]">
        {row.name} · {row.contact} · {row.animal} · {formatBytes(row.sizeBytes)}
      </p>
      <p className="text-sm">{t("adminFileKept")}</p>
      {row.note ? <p className="text-sm leading-relaxed">{row.note}</p> : null}
      <NoteField id={`${row.id}-note`} value={note} onChange={setNote} />
      {error ? <p className="text-sm text-[#8d2b16]">{error}</p> : null}
      <ActionRow next={step.next} also={step.also} labelFor={(status) => t(prescriptionActionKey[status])} onApply={apply} />
    </div>
  );
}

function ConsultationList() {
  const { t } = useI18n();
  const { consultations } = useDemo();
  const [id, setId] = useState<string | null>(null);
  const row = consultations.find((item) => item.id === id) ?? null;

  return (
    <>
      {consultations.length === 0 ? <p className="text-sm">{t("adminEmpty")}</p> : null}
      <ul className="grid gap-2">
        {consultations.map((item) => (
          <li key={item.id}>
            <button type="button" className="grid w-full gap-1 rounded-lg border border-[#e6eee8] p-3 text-left hover:border-[#b7d0be] sm:grid-cols-[7rem_1fr_auto]" onClick={() => setId(item.id)}>
              <span className="font-bold">
                {item.id}
                {item.sample ? <Sample /> : null}
              </span>
              <span>
                <span className="block font-semibold">{item.name}</span>
                <span className="block text-sm text-[#3e4c45]">{item.createdLabel}</span>
              </span>
              <span className="text-sm font-semibold text-[#0e4d28]">
                {t(consultationStatusKey[item.status])}
                <span className="mt-1 block font-semibold underline">{t("adminOpenDetails")}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(row)} title={row?.id ?? t("adminConsultations")} closeLabel={t("navClose")} onClose={() => setId(null)} wide>
        {row ? <ConsultationDetail key={row.id} row={row} /> : null}
      </Dialog>
    </>
  );
}

function ConsultationDetail({ row }: { row: ConsultationRequest }) {
  const { t } = useI18n();
  const { updateConsultation } = useDemo();
  const [note, setNote] = useState(row.staffNote);
  const [error, setError] = useState("");
  const step = consultationStep(row.status);

  function apply(status: ConsultationStatus) {
    if (status === "needs-info" && note.trim().length < 3) {
      setError(t("adminNoteError"));
      return;
    }
    setError("");
    updateConsultation(row.id, { status, staffNote: note.trim() });
  }

  return (
    <div className="grid gap-3 text-[#1c2420]">
      <p className="text-sm font-semibold text-[#0e4d28]">{t(consultationStatusKey[row.status])}</p>
      <p className="text-sm text-[#3e4c45]">
        {row.name} · {row.contact} · {row.animal} · {row.createdLabel}
      </p>
      <p className="text-sm">
        <span className="font-semibold">{t("adminConsultConcern")}: </span>
        {row.concern}
      </p>
      <p className="text-sm">
        <span className="font-semibold">{t("adminConsultTime")}: </span>
        {row.timeLabel}
      </p>
      {row.filename ? (
        <p className="text-sm">
          {row.filename} · {formatBytes(row.sizeBytes)}
        </p>
      ) : (
        <p className="text-sm">{t("adminNoFile")}</p>
      )}
      <p className="text-sm">{t("adminFileKept")}</p>
      <NoteField id={`${row.id}-note`} value={note} onChange={setNote} />
      {error ? <p className="text-sm text-[#8d2b16]">{error}</p> : null}
      <ActionRow next={step.next} also={step.also} labelFor={(status) => t(consultationActionKey[status])} onApply={apply} />
    </div>
  );
}

function NoteField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={id}>
        {t("adminNote")}
      </label>
      <textarea id={id} rows={2} className="mt-1 w-full rounded-lg border border-[#d5e0d8] px-3 py-2 text-base" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ActionRow<T extends string>({
  next,
  also,
  labelFor,
  onApply,
}: {
  next: T | null;
  also: T[];
  labelFor: (status: T) => string;
  onApply: (status: T) => void;
}) {
  const { t } = useI18n();
  if (!next && also.length === 0) return <p className="text-sm text-[#3e4c45]">{t("adminNoFurther")}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {next ? (
        <button type="button" className={btnPrimary} onClick={() => onApply(next)}>
          {labelFor(next)}
        </button>
      ) : null}
      {also.map((status) => (
        <button key={status} type="button" className={btnSecondary} onClick={() => onApply(status)}>
          {labelFor(status)}
        </button>
      ))}
    </div>
  );
}
