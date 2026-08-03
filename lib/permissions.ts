export const USER_ROLES = ["owner", "sales", "factory", "installer", "customer"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type Permission =
  | "users.manage"
  | "customers.view"
  | "customers.manage"
  | "orders.view.all"
  | "orders.view.assigned"
  | "orders.create"
  | "orders.edit"
  | "orders.confirm"
  | "pricing.view.wholesale"
  | "factory.update"
  | "installation.update"
  | "shipping.manage"
  | "payments.manage"
  | "finance.view"
  | "reports.view";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  owner: [
    "users.manage", "customers.view", "customers.manage", "orders.view.all",
    "orders.view.assigned", "orders.create", "orders.edit", "orders.confirm",
    "pricing.view.wholesale", "factory.update", "installation.update",
    "shipping.manage", "payments.manage", "finance.view", "reports.view",
  ],
  sales: [
    "customers.view", "customers.manage", "orders.view.assigned", "orders.create",
    "orders.edit", "orders.confirm", "pricing.view.wholesale", "shipping.manage",
  ],
  factory: ["orders.view.assigned", "factory.update"],
  installer: ["orders.view.assigned", "installation.update"],
  customer: ["orders.view.assigned"],
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canViewEveryOrder(role: UserRole) {
  return hasPermission(role, "orders.view.all");
}

export function canAccessOrder(input: {
  role: UserRole;
  userId: number;
  assignedUserIds: readonly number[];
  customerUserId?: number | null;
}) {
  if (canViewEveryOrder(input.role)) return true;
  if (input.customerUserId === input.userId) return true;
  return input.assignedUserIds.includes(input.userId);
}

export function visibleNavigation(role: UserRole) {
  const common = ["dashboard", "orders"];
  const byRole: Record<UserRole, string[]> = {
    owner: ["customers", "quotes", "invoices", "factories", "shipping", "installation", "finance", "reports", "resources", "users", "settings"],
    sales: ["customers", "quotes", "invoices", "shipping", "resources"],
    factory: ["factory-orders", "shipping", "resources"],
    installer: ["installation", "resources"],
    customer: ["quotes", "invoices", "tracking", "installation"],
  };
  return [...common, ...byRole[role]];
}
