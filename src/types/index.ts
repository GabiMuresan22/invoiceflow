export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";

export type AutomationTrigger =
  | "INVOICE_DUE_SOON"
  | "INVOICE_OVERDUE"
  | "PAYMENT_RECEIVED"
  | "SCHEDULE_MONTHLY"
  | "SCHEDULE_WEEKLY";
