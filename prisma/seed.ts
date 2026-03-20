import { PrismaClient } from "@prisma/client";
import { addDays, subDays, subMonths } from "date-fns";

const prisma = new PrismaClient();

const now = new Date();

async function main() {
  console.log("🌱 Seeding database…");

  // Clean up
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.client.deleteMany();
  await prisma.automation.deleteMany();

  // ── Clients ────────────────────────────────────────────────
  const acme = await prisma.client.create({
    data: {
      name: "Alex Johnson",
      email: "billing@acme.co",
      company: "Acme Corp",
      phone: "+1 (415) 555-0192",
      address: "500 Market St, Suite 20",
      city: "San Francisco",
      state: "CA",
      country: "US",
      notes:
        "Long-term client since 2023. Prefers invoices sent on the 10th of each month.",
    },
  });

  const bright = await prisma.client.create({
    data: {
      name: "Maya Reed",
      email: "hello@brightstudio.io",
      company: "Bright Studio",
      phone: "+1 (310) 555-0847",
      address: "123 Creative Ave, Suite 4",
      city: "San Francisco",
      state: "CA",
      country: "US",
    },
  });

  const tech = await prisma.client.create({
    data: {
      name: "Sam Park",
      email: "accounts@techvision.io",
      company: "TechVision Inc",
      phone: "+1 (628) 555-0341",
      address: "88 Innovation Blvd",
      city: "Austin",
      state: "TX",
      country: "US",
    },
  });

  const loops = await prisma.client.create({
    data: {
      name: "Jamie Torres",
      email: "pay@loops.co",
      company: "Loops Agency",
      phone: "+1 (512) 555-0029",
      address: "44 Brand Way",
      city: "Brooklyn",
      state: "NY",
      country: "US",
    },
  });

  const nova = await prisma.client.create({
    data: {
      name: "Chris Lee",
      email: "invoice@novadesign.co",
      company: "Nova Design Co",
      phone: "+1 (206) 555-0774",
      address: "18 Pixel St",
      city: "Seattle",
      state: "WA",
      country: "US",
    },
  });

  const stellar = await prisma.client.create({
    data: {
      name: "Dana Kim",
      email: "finance@stellarmedia.io",
      company: "Stellar Media",
      phone: "+1 (323) 555-0513",
      address: "700 Sunset Blvd",
      city: "Los Angeles",
      state: "CA",
      country: "US",
    },
  });

  // ── Helper ─────────────────────────────────────────────────
  let invoiceCounter = 84;
  function nextInvNum() {
    invoiceCounter--;
    return `INV-${String(invoiceCounter).padStart(4, "0")}`;
  }

  async function createInvoice(data: {
    client: typeof acme;
    status: string;
    issueDate: Date;
    dueDate: Date;
    items: { description: string; quantity: number; unitPrice: number }[];
    taxRate?: number;
    notes?: string;
    paid?: boolean;
    paidAt?: Date;
  }) {
    const subtotal = data.items.reduce(
      (s, i) => s + i.quantity * i.unitPrice,
      0
    );
    const taxRate = data.taxRate ?? 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const inv = await prisma.invoice.create({
      data: {
        number: nextInvNum(),
        clientId: data.client.id,
        status: data.status,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        notes: data.notes ?? null,
        taxRate,
        taxAmount,
        subtotal,
        total,
        terms: "Net 30",
        items: {
          create: data.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
          })),
        },
      },
    });

    if (data.paid) {
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          amount: total,
          method: "Bank Transfer",
          paidAt: data.paidAt ?? data.dueDate,
        },
      });
    }

    return inv;
  }

  // ── Invoices ────────────────────────────────────────────────

  // INV-0083 – Bright Studio – SENT
  await createInvoice({
    client: bright,
    status: "SENT",
    issueDate: subDays(now, 5),
    dueDate: addDays(now, 26),
    items: [
      { description: "Brand identity design", quantity: 1, unitPrice: 1500 },
      { description: "Social media kit (10 templates)", quantity: 1, unitPrice: 350 },
    ],
  });

  // INV-0082 – Acme Corp – PAID
  await createInvoice({
    client: acme,
    status: "PAID",
    issueDate: subDays(now, 10),
    dueDate: addDays(now, 20),
    items: [
      { description: "Website redesign – Phase 2", quantity: 1, unitPrice: 3800 },
      { description: "SEO audit", quantity: 1, unitPrice: 400 },
    ],
    taxRate: 10,
    paid: true,
    paidAt: subDays(now, 2),
  });

  // INV-0081 – TechVision – OVERDUE
  await createInvoice({
    client: tech,
    status: "OVERDUE",
    issueDate: subDays(now, 50),
    dueDate: subDays(now, 21),
    items: [
      { description: "Mobile app UI/UX design", quantity: 1, unitPrice: 2200 },
      { description: "Prototype – 5 screens", quantity: 5, unitPrice: 100 },
    ],
  });

  // INV-0080 – Loops Agency – PAID
  await createInvoice({
    client: loops,
    status: "PAID",
    issueDate: subDays(now, 28),
    dueDate: subDays(now, 1),
    items: [
      { description: "Campaign strategy deck", quantity: 1, unitPrice: 960 },
    ],
    paid: true,
    paidAt: subDays(now, 3),
  });

  // INV-0079 – Nova Design – DRAFT
  await createInvoice({
    client: nova,
    status: "DRAFT",
    issueDate: subDays(now, 34),
    dueDate: subDays(now, 4),
    items: [
      { description: "E-commerce store design", quantity: 1, unitPrice: 2800 },
      { description: "Icon set (30 icons)", quantity: 1, unitPrice: 300 },
    ],
  });

  // INV-0078 – Stellar Media – PAID
  await createInvoice({
    client: stellar,
    status: "PAID",
    issueDate: subDays(now, 43),
    dueDate: subDays(now, 13),
    items: [
      { description: "Video production – 3 episodes", quantity: 3, unitPrice: 1600 },
      { description: "Post-production editing", quantity: 1, unitPrice: 600 },
    ],
    taxRate: 10,
    paid: true,
    paidAt: subDays(now, 15),
  });

  // INV-0077 – Blueprint Labs – OVERDUE (created as Loops stand-in)
  await createInvoice({
    client: loops,
    status: "OVERDUE",
    issueDate: subDays(now, 48),
    dueDate: subDays(now, 18),
    items: [
      { description: "Brand refresh – logo variants", quantity: 1, unitPrice: 1200 },
    ],
  });

  // Historical paid invoices for Acme
  for (let i = 0; i < 8; i++) {
    await createInvoice({
      client: acme,
      status: "PAID",
      issueDate: subMonths(now, i + 2),
      dueDate: addDays(subMonths(now, i + 2), 30),
      items: [
        {
          description: `Retainer – Month ${i + 1}`,
          quantity: 1,
          unitPrice: 3200 + Math.floor(Math.random() * 800),
        },
      ],
      paid: true,
      paidAt: addDays(subMonths(now, i + 2), 8),
    });
  }

  // Historical paid invoices for Stellar
  for (let i = 0; i < 4; i++) {
    await createInvoice({
      client: stellar,
      status: "PAID",
      issueDate: subMonths(now, i + 3),
      dueDate: addDays(subMonths(now, i + 3), 30),
      items: [
        {
          description: `Video production retainer`,
          quantity: 1,
          unitPrice: 1800 + Math.floor(Math.random() * 400),
        },
      ],
      paid: true,
      paidAt: addDays(subMonths(now, i + 3), 12),
    });
  }

  // ── Automations ────────────────────────────────────────────
  await prisma.automation.createMany({
    data: [
      {
        name: "Payment Reminder — 3 days before due",
        description: "Sends an email reminder to clients 3 days before an invoice is due.",
        trigger: "INVOICE_DUE_SOON",
        enabled: true,
        runCount: 14,
        lastRunAt: subDays(now, 0),
      },
      {
        name: "Monthly Recurring Billing — Acme Corp",
        description: "Auto-creates and sends a recurring invoice to Acme Corp on the 10th of each month.",
        trigger: "SCHEDULE_MONTHLY",
        enabled: true,
        runCount: 6,
        lastRunAt: subDays(now, 10),
      },
      {
        name: "Overdue Escalation — 7 days overdue",
        description: "Sends an escalation email when an invoice is 7 days past due.",
        trigger: "INVOICE_OVERDUE",
        enabled: false,
        runCount: 3,
        lastRunAt: subDays(now, 5),
      },
      {
        name: "Payment Confirmation Thank-You",
        description: "Automatically sends a thank-you email when a payment is recorded.",
        trigger: "PAYMENT_RECEIVED",
        enabled: true,
        runCount: 22,
        lastRunAt: subDays(now, 2),
      },
    ],
  });

  console.log("✅ Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
