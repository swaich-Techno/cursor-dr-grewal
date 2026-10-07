export type CustomerStatus =
  | "new"
  | "in-review"
  | "needs-info"
  | "approved"
  | "quote-ready"
  | "payment-simulated";

export type DistributorStatus = "new" | "in-review" | "needs-info" | "approved";
export type PrescriptionStatus = "awaiting-review" | "needs-info" | "accepted";

type Step<T extends string> = { next: T | null; also: T[] };

const customerSteps: Record<CustomerStatus, Step<CustomerStatus>> = {
  new: { next: "in-review", also: [] },
  "in-review": { next: "approved", also: ["needs-info"] },
  "needs-info": { next: "in-review", also: [] },
  approved: { next: "quote-ready", also: [] },
  "quote-ready": { next: "payment-simulated", also: [] },
  "payment-simulated": { next: null, also: [] },
};

const distributorSteps: Record<DistributorStatus, Step<DistributorStatus>> = {
  new: { next: "in-review", also: [] },
  "in-review": { next: "approved", also: ["needs-info"] },
  "needs-info": { next: "in-review", also: [] },
  approved: { next: null, also: [] },
};

const prescriptionSteps: Record<PrescriptionStatus, Step<PrescriptionStatus>> = {
  "awaiting-review": { next: "accepted", also: ["needs-info"] },
  "needs-info": { next: "awaiting-review", also: [] },
  accepted: { next: null, also: [] },
};

function allows<T extends string>(step: Step<T>, from: T, to: T) {
  if (from === to) return true;
  return step.next === to || step.also.includes(to);
}

export function customerStep(status: CustomerStatus) {
  return customerSteps[status];
}

export function distributorStep(status: DistributorStatus) {
  return distributorSteps[status];
}

export function prescriptionStep(status: PrescriptionStatus) {
  return prescriptionSteps[status];
}

export function canSetCustomerStatus(from: CustomerStatus, to: CustomerStatus) {
  return allows(customerSteps[from], from, to);
}

export function canSetDistributorStatus(from: DistributorStatus, to: DistributorStatus) {
  return allows(distributorSteps[from], from, to);
}

export function canSetPrescriptionStatus(from: PrescriptionStatus, to: PrescriptionStatus) {
  return allows(prescriptionSteps[from], from, to);
}

export function customerAwaiting(status: CustomerStatus) {
  return status !== "payment-simulated";
}

export function distributorAwaiting(status: DistributorStatus) {
  return status !== "approved";
}

export function prescriptionAwaiting(status: PrescriptionStatus) {
  return status !== "accepted";
}
