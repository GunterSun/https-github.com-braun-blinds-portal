import{sql}from"drizzle-orm";import{index,integer,sqliteTable,text,uniqueIndex}from"drizzle-orm/sqlite-core";

export const manufacturingDrawings=sqliteTable("manufacturing_drawings",{
 id:integer("id").primaryKey({autoIncrement:true}),
 windowId:integer("window_id").notNull(),
 measurementVersionId:integer("measurement_version_id").notNull(),
 version:integer("version").notNull(),
 status:text("status").notNull().default("draft"),
 sourceSnapshotJson:text("source_snapshot_json").notNull(),
 productionJson:text("production_json").notNull(),
 documentSha256:text("document_sha256").notNull(),
 createdBy:integer("created_by").notNull(),
 approvedBy:integer("approved_by"),
 approvedAt:text("approved_at"),
 supersededById:integer("superseded_by_id"),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
 updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
},t=>({windowVersionUnique:uniqueIndex("manufacturing_drawings_window_version_unique").on(t.windowId,t.version),windowIdx:index("manufacturing_drawings_window_idx").on(t.windowId,t.createdAt),measurementIdx:index("manufacturing_drawings_measurement_idx").on(t.measurementVersionId),statusIdx:index("manufacturing_drawings_status_idx").on(t.status)}));

export const manufacturingFactoryAssignments=sqliteTable("manufacturing_factory_assignments",{
 id:integer("id").primaryKey({autoIncrement:true}),
 drawingId:integer("drawing_id").notNull(),
 factoryName:text("factory_name").notNull(),
 factoryCode:text("factory_code").notNull().default(""),
 scopeJson:text("scope_json").notNull().default("{}"),
 status:text("status").notNull().default("assigned"),
 notes:text("notes").notNull().default(""),
 createdBy:integer("created_by").notNull(),
 createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
 updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
},t=>({drawingIdx:index("manufacturing_factory_assignments_drawing_idx").on(t.drawingId),factoryIdx:index("manufacturing_factory_assignments_factory_idx").on(t.factoryCode,t.status)}));
