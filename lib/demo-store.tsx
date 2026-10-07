"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/lib/catalog";
import type { ChatLocale } from "@/lib/chat-demo";
import {
  canSetConsultationStatus,
  canSetCustomerStatus,
  canSetDistributorStatus,
  canSetPrescriptionStatus,
  type ConsultationStatus,
  type CustomerStatus,
  type DistributorStatus,
  type PrescriptionStatus,
} from "@/lib/workflow";

export type { ConsultationStatus, CustomerStatus, DistributorStatus, PrescriptionStatus };
export type { ChatLocale };

export type BasketLine = { slug: string; quantity: number };

export type CustomerEnquiry = {
  id: string;
  sample: boolean;
  createdLabel: string;
  name: string;
  contact: string;
  animal: string;
  message: string;
  items: { slug: string; name: string; quantity: number }[];
  askedName?: string;
  status: CustomerStatus;
  staffNote: string;
};

export type DistributorEnquiry = {
  id: string;
  sample: boolean;
  createdLabel: string;
  contactName: string;
  businessName: string;
  city: string;
  message: string;
  status: DistributorStatus;
  staffNote: string;
};

export type PrescriptionRequest = {
  id: string;
  sample: boolean;
  createdLabel: string;
  name: string;
  contact: string;
  animal: string;
  filename: string;
  sizeBytes: number;
  note: string;
  status: PrescriptionStatus;
  staffNote: string;
};

export type ConsultationRequest = {
  id: string;
  sample: boolean;
  createdLabel: string;
  name: string;
  contact: string;
  animal: string;
  concern: string;
  timeLabel: string;
  filename: string;
  sizeBytes: number;
  status: ConsultationStatus;
  staffNote: string;
};

export type ChatTurn =
  | { id: string; role: "visitor"; text: string }
  | { id: string; role: "assistant"; kind: "suggest"; slug: string }
  | { id: string; role: "assistant"; kind: "consult"; concern: string }
  | { id: string; role: "assistant"; kind: "clarify" }
  | { id: string; role: "assistant"; kind: "booked"; reference: string };

type ProductOverride = {
  summary?: string;
  detail?: string;
  notice?: string;
  confirmation?: string;
};

type DemoState = {
  basket: BasketLine[];
  customers: CustomerEnquiry[];
  distributors: DistributorEnquiry[];
  prescriptions: PrescriptionRequest[];
  consultations: ConsultationRequest[];
  chat: ChatTurn[];
  chatLocale: ChatLocale | null;
  sessionNonce: number;
  overrides: Record<string, ProductOverride>;
};

function nowLabel() {
  return new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function nextId(prefix: string, rows: { id: string }[]) {
  const max = rows.reduce((highest, row) => {
    const value = Number(row.id.slice(prefix.length + 1));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 100);
  return `${prefix}-${max + 1}`;
}

function initialState(): DemoState {
  return {
    basket: [],
    overrides: {},
    customers: [
      {
        id: "C-101",
        sample: true,
        createdLabel: "Sample record",
        name: "Sample Customer",
        contact: "demo@example.com",
        animal: "Cattle",
        message: "Demonstration record only. This is not a real enquiry.",
        items: [{ slug: "g-appet", name: "G Appet", quantity: 1 }],
        status: "new",
        staffNote: "",
      },
    ],
    distributors: [
      {
        id: "D-101",
        sample: true,
        createdLabel: "Sample record",
        contactName: "Sample Contact",
        businessName: "Demo Trading Co.",
        city: "Mohali",
        message: "Demonstration distributor enquiry. Not a real business.",
        status: "new",
        staffNote: "",
      },
    ],
    prescriptions: [
      {
        id: "P-101",
        sample: true,
        createdLabel: "Sample record",
        name: "Sample Customer",
        contact: "demo@example.com",
        animal: "Dog",
        filename: "sample-prescription.pdf",
        sizeBytes: 120000,
        note: "No file is stored. This queue item is a sample.",
        status: "awaiting-review",
        staffNote: "",
      },
    ],
    consultations: [
      {
        id: "A-101",
        sample: true,
        createdLabel: "Sample record",
        name: "Sample Customer",
        contact: "demo@example.com",
        animal: "Horse",
        concern: "Demonstration concern that is not in the six-product sample.",
        timeLabel: "Morning sample",
        filename: "sample-hoof.jpg",
        sizeBytes: 180000,
        status: "new",
        staffNote: "",
      },
    ],
    chat: [],
    chatLocale: null,
    sessionNonce: 0,
  };
}

type DemoValue = DemoState & {
  itemCount: number;
  catalogue: Product[];
  addToBasket: (slug: string, quantity: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeFromBasket: (slug: string) => void;
  submitCustomer: (
    input: Omit<CustomerEnquiry, "id" | "sample" | "createdLabel" | "status" | "staffNote">,
  ) => string;
  submitDistributor: (
    input: Omit<DistributorEnquiry, "id" | "sample" | "createdLabel" | "status" | "staffNote">,
  ) => string;
  submitPrescription: (
    input: Omit<PrescriptionRequest, "id" | "sample" | "createdLabel" | "status" | "staffNote">,
  ) => string;
  updateCustomer: (id: string, patch: Partial<Pick<CustomerEnquiry, "status" | "staffNote">>) => void;
  updateDistributor: (
    id: string,
    patch: Partial<Pick<DistributorEnquiry, "status" | "staffNote">>,
  ) => void;
  updatePrescription: (
    id: string,
    patch: Partial<Pick<PrescriptionRequest, "status" | "staffNote">>,
  ) => void;
  submitConsultation: (
    input: Omit<ConsultationRequest, "id" | "sample" | "createdLabel" | "status" | "staffNote">,
  ) => string;
  updateConsultation: (
    id: string,
    patch: Partial<Pick<ConsultationRequest, "status" | "staffNote">>,
  ) => void;
  appendChat: (turns: ChatTurn[]) => void;
  setChatLocale: (locale: ChatLocale) => void;
  saveProduct: (slug: string, override: ProductOverride) => void;
  resetDemo: () => void;
};

const DemoContext = createContext<DemoValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState);

  const addToBasket = useCallback((slug: string, quantity: number) => {
    const qty = Math.min(20, Math.max(1, quantity));
    setState((prev) => {
      const existing = prev.basket.find((line) => line.slug === slug);
      const basket = existing
        ? prev.basket.map((line) =>
            line.slug === slug ? { ...line, quantity: Math.min(20, line.quantity + qty) } : line,
          )
        : [...prev.basket, { slug, quantity: qty }];
      return { ...prev, basket };
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setState((prev) => ({
      ...prev,
      basket:
        quantity < 1
          ? prev.basket.filter((line) => line.slug !== slug)
          : prev.basket.map((line) =>
              line.slug === slug ? { ...line, quantity: Math.min(20, quantity) } : line,
            ),
    }));
  }, []);

  const removeFromBasket = useCallback((slug: string) => {
    setState((prev) => ({ ...prev, basket: prev.basket.filter((line) => line.slug !== slug) }));
  }, []);

  const submitCustomer = useCallback(
    (input: Omit<CustomerEnquiry, "id" | "sample" | "createdLabel" | "status" | "staffNote">) => {
      let created = "";
      setState((prev) => {
        created = nextId("C", prev.customers);
        const enquiry: CustomerEnquiry = {
          ...input,
          id: created,
          sample: false,
          createdLabel: nowLabel(),
          status: "new",
          staffNote: "",
        };
        return { ...prev, customers: [enquiry, ...prev.customers], basket: [] };
      });
      return created;
    },
    [],
  );

  const submitDistributor = useCallback(
    (
      input: Omit<DistributorEnquiry, "id" | "sample" | "createdLabel" | "status" | "staffNote">,
    ) => {
      let created = "";
      setState((prev) => {
        created = nextId("D", prev.distributors);
        const enquiry: DistributorEnquiry = {
          ...input,
          id: created,
          sample: false,
          createdLabel: nowLabel(),
          status: "new",
          staffNote: "",
        };
        return { ...prev, distributors: [enquiry, ...prev.distributors] };
      });
      return created;
    },
    [],
  );

  const submitPrescription = useCallback(
    (
      input: Omit<PrescriptionRequest, "id" | "sample" | "createdLabel" | "status" | "staffNote">,
    ) => {
      let created = "";
      setState((prev) => {
        created = nextId("P", prev.prescriptions);
        const request: PrescriptionRequest = {
          ...input,
          id: created,
          sample: false,
          createdLabel: nowLabel(),
          status: "awaiting-review",
          staffNote: "",
        };
        return { ...prev, prescriptions: [request, ...prev.prescriptions] };
      });
      return created;
    },
    [],
  );

  const updateCustomer = useCallback(
    (id: string, patch: Partial<Pick<CustomerEnquiry, "status" | "staffNote">>) => {
      setState((prev) => ({
        ...prev,
        customers: prev.customers.map((row) => {
          if (row.id !== id) return row;
          const status = patch.status && canSetCustomerStatus(row.status, patch.status) ? patch.status : row.status;
          return { ...row, ...patch, status };
        }),
      }));
    },
    [],
  );

  const updateDistributor = useCallback(
    (id: string, patch: Partial<Pick<DistributorEnquiry, "status" | "staffNote">>) => {
      setState((prev) => ({
        ...prev,
        distributors: prev.distributors.map((row) => {
          if (row.id !== id) return row;
          const status = patch.status && canSetDistributorStatus(row.status, patch.status) ? patch.status : row.status;
          return { ...row, ...patch, status };
        }),
      }));
    },
    [],
  );

  const submitConsultation = useCallback(
    (input: Omit<ConsultationRequest, "id" | "sample" | "createdLabel" | "status" | "staffNote">) => {
      let created = "";
      setState((prev) => {
        created = nextId("A", prev.consultations);
        const request: ConsultationRequest = {
          ...input,
          id: created,
          sample: false,
          createdLabel: nowLabel(),
          status: "new",
          staffNote: "",
        };
        return { ...prev, consultations: [request, ...prev.consultations] };
      });
      return created;
    },
    [],
  );

  const updateConsultation = useCallback(
    (id: string, patch: Partial<Pick<ConsultationRequest, "status" | "staffNote">>) => {
      setState((prev) => ({
        ...prev,
        consultations: prev.consultations.map((row) => {
          if (row.id !== id) return row;
          const status =
            patch.status && canSetConsultationStatus(row.status, patch.status) ? patch.status : row.status;
          return { ...row, ...patch, status };
        }),
      }));
    },
    [],
  );

  const appendChat = useCallback((turns: ChatTurn[]) => {
    setState((prev) => ({ ...prev, chat: [...prev.chat, ...turns] }));
  }, []);

  const setChatLocale = useCallback((chatLocale: ChatLocale) => {
    setState((prev) => ({ ...prev, chatLocale }));
  }, []);

  const updatePrescription = useCallback(
    (id: string, patch: Partial<Pick<PrescriptionRequest, "status" | "staffNote">>) => {
      setState((prev) => ({
        ...prev,
        prescriptions: prev.prescriptions.map((row) => {
          if (row.id !== id) return row;
          const status = patch.status && canSetPrescriptionStatus(row.status, patch.status) ? patch.status : row.status;
          return { ...row, ...patch, status };
        }),
      }));
    },
    [],
  );

  const saveProduct = useCallback((slug: string, override: ProductOverride) => {
    setState((prev) => ({
      ...prev,
      overrides: { ...prev.overrides, [slug]: { ...prev.overrides[slug], ...override } },
    }));
  }, []);

  const resetDemo = useCallback(() => setState({ ...initialState(), sessionNonce: Date.now() }), []);

  const catalogue = useMemo(
    () =>
      products.map((product) => {
        const override = state.overrides[product.slug];
        if (!override) return product;
        return {
          ...product,
          summary: override.summary ?? product.summary,
          detail: override.detail ?? product.detail,
          notice: override.notice ?? product.notice,
          confirmation: override.confirmation ?? product.confirmation,
        };
      }),
    [state.overrides],
  );

  const value = useMemo<DemoValue>(
    () => ({
      ...state,
      itemCount: state.basket.reduce((sum, line) => sum + line.quantity, 0),
      catalogue,
      addToBasket,
      setQuantity,
      removeFromBasket,
      submitCustomer,
      submitDistributor,
      submitPrescription,
      updateCustomer,
      updateDistributor,
      updatePrescription,
      submitConsultation,
      updateConsultation,
      appendChat,
      setChatLocale,
      saveProduct,
      resetDemo,
    }),
    [
      state,
      catalogue,
      addToBasket,
      setQuantity,
      removeFromBasket,
      submitCustomer,
      submitDistributor,
      submitPrescription,
      updateCustomer,
      updateDistributor,
      updatePrescription,
      submitConsultation,
      updateConsultation,
      appendChat,
      setChatLocale,
      saveProduct,
      resetDemo,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used within DemoProvider");
  return value;
}
