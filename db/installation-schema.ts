import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const installationJobs=sqliteTable("installation_jobs",{
  id:integer("id").primaryKey({autoIncrement:true}),orderId:integer("order_id").notNull(),status:text("status").notNull().default("scheduled"),
  scheduledStart:text("scheduled_start").notNull(),scheduledEnd:text("scheduled_end").notNull(),timezone:text("timezone").notNull().default("America/Los_Angeles"),
  addressSnapshot:text("address_snapshot").notNull(),contactSnapshot:text("contact_snapshot").notNull(),instructions:text("instructions").notNull().default(""),
  balanceDueSnapshot:real("balance_due_snapshot").notNull().default(0),jobType:text("job_type").notNull().default("initial"),version:integer("version").notNull().default(1),
  idempotencyKey:text("idempotency_key").notNull().unique(),createdBy:integer("created_by").notNull(),updatedBy:integer("updated_by").notNull(),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},table=>({scheduleIdx:index("installation_jobs_schedule_idx").on(table.scheduledStart,table.status),orderIdx:index("installation_jobs_order_idx").on(table.orderId)}));

export const installationAssignments=sqliteTable("installation_assignments",{
  id:integer("id").primaryKey({autoIncrement:true}),installationJobId:integer("installation_job_id").notNull(),installerUserId:integer("installer_user_id").notNull(),role:text("role").notNull().default("lead"),acceptedAt:text("accepted_at"),startedAt:text("started_at"),completedAt:text("completed_at"),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},table=>({jobInstallerUnique:uniqueIndex("installation_assignments_job_installer_unique").on(table.installationJobId,table.installerUserId),installerIdx:index("installation_assignments_installer_idx").on(table.installerUserId)}));

export const installationStatusEvents=sqliteTable("installation_status_events",{
  id:integer("id").primaryKey({autoIncrement:true}),installationJobId:integer("installation_job_id").notNull(),fromStatus:text("from_status").notNull(),toStatus:text("to_status").notNull(),actorUserId:integer("actor_user_id").notNull(),source:text("source").notNull().default("portal"),note:text("note").notNull().default(""),idempotencyKey:text("idempotency_key").notNull().unique(),occurredAt:text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},table=>({jobIdx:index("installation_status_events_job_idx").on(table.installationJobId)}));
