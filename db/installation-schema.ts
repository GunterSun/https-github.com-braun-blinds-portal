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

export const customerInstallationDetails=sqliteTable("customer_installation_details",{
  id:integer("id").primaryKey({autoIncrement:true}),installationJobId:integer("installation_job_id").notNull().unique(),teamDisplayName:text("team_display_name").notNull().default(""),showTeam:integer("show_team",{mode:"boolean"}).notNull().default(false),preparationNotes:text("preparation_notes").notNull().default(""),accessInstructions:text("access_instructions").notNull().default(""),checklistJson:text("checklist_json").notNull().default("[]"),showBalanceReminder:integer("show_balance_reminder",{mode:"boolean"}).notNull().default(false),updatedBy:integer("updated_by").notNull(),updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},table=>({jobIdx:index("customer_installation_details_job_idx").on(table.installationJobId)}));
export const installationRescheduleRequests=sqliteTable("installation_reschedule_requests",{
  id:integer("id").primaryKey({autoIncrement:true}),installationJobId:integer("installation_job_id").notNull(),userId:integer("user_id").notNull(),requestedStart:text("requested_start"),requestedEnd:text("requested_end"),requestContact:integer("request_contact",{mode:"boolean"}).notNull().default(false),reason:text("reason").notNull().default(""),status:text("status").notNull().default("pending"),idempotencyKey:text("idempotency_key").notNull().unique(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),resolvedAt:text("resolved_at"),
},table=>({jobIdx:index("installation_reschedule_requests_job_idx").on(table.installationJobId,table.status)}));
export const installationCompletionRecords=sqliteTable("installation_completion_records",{
  id:integer("id").primaryKey({autoIncrement:true}),installationJobId:integer("installation_job_id").notNull().unique(),completedItemsJson:text("completed_items_json").notNull(),photoUrlsJson:text("photo_urls_json").notNull().default("[]"),exceptionsJson:text("exceptions_json").notNull().default("[]"),publishedBy:integer("published_by").notNull(),publishedAt:text("published_at").notNull(),
},table=>({jobIdx:index("installation_completion_records_job_idx").on(table.installationJobId)}));
export const installationCompletionSignatures=sqliteTable("installation_completion_signatures",{
  id:integer("id").primaryKey({autoIncrement:true}),completionRecordId:integer("completion_record_id").notNull().unique(),userId:integer("user_id").notNull(),printedName:text("printed_name").notNull(),signatureText:text("signature_text").notNull(),evidenceSha256:text("evidence_sha256").notNull().unique(),idempotencyKey:text("idempotency_key").notNull().unique(),signedAt:text("signed_at").notNull(),
});
export const installationServiceRequests=sqliteTable("installation_service_requests",{
  id:integer("id").primaryKey({autoIncrement:true}),installationJobId:integer("installation_job_id").notNull(),userId:integer("user_id").notNull(),roomCode:text("room_code").notNull(),windowCode:text("window_code").notNull(),description:text("description").notNull(),photoUrlsJson:text("photo_urls_json").notNull().default("[]"),status:text("status").notNull().default("open"),idempotencyKey:text("idempotency_key").notNull().unique(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},table=>({jobIdx:index("installation_service_requests_job_idx").on(table.installationJobId,table.status)}));
