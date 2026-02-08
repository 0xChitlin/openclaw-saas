import fs from "fs";
import path from "path";

export interface Customer {
  id: string;
  email: string;
  password: string;
  name: string;
  company: string;
  plan: string;
  agentStatus: string;
  integrations: string[];
  onboarded: boolean;
  createdAt: string;
  onboarding?: {
    tasks: string[];
    tools: string[];
    workHours: { start: string; end: string };
    responseStyle: string;
    notifications: string;
  };
}

const DATA_PATH = path.join(process.cwd(), "data", "customers.json");

export function getCustomers(): Customer[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Customer[];
  } catch {
    return [];
  }
}

export function findCustomerByEmail(email: string): Customer | undefined {
  return getCustomers().find((c) => c.email === email);
}

export function findCustomerById(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id);
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
  const customers = getCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...updates };
  fs.writeFileSync(DATA_PATH, JSON.stringify(customers, null, 2));
  return customers[idx];
}

export function createCustomer(data: Omit<Customer, "id" | "createdAt">): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...data,
    id: `cust_${String(customers.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  fs.writeFileSync(DATA_PATH, JSON.stringify(customers, null, 2));
  return newCustomer;
}
