import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["client", "girl"] }).notNull(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const girlProfiles = sqliteTable("girl_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  price: integer("price").notNull().default(200),
  status: text("status", { enum: ["idle", "busy", "off"] }).notNull().default("idle"),
  avatarEmoji: text("avatar_emoji").notNull().default("🖤"),
  totalOrders: integer("total_orders").notNull().default(0),
  avgRating: integer("avg_rating").notNull().default(0),
  tonightPersona: text("tonight_persona").notNull().default(""),
  tonightBody: text("tonight_body").notNull().default(""),
  tonightAllowed: text("tonight_allowed").notNull().default(""),
  tonightOpening: text("tonight_opening").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => users.id),
  girlId: text("girl_id").notNull().references(() => users.id),
  fantasyType: text("fantasy_type").notNull(),
  fantasyDetail: text("fantasy_detail").notNull(),
  tone: text("tone").notNull(),
  scene: text("scene").notNull().default(""),
  status: text("status", { enum: ["pending", "accepted", "serving", "completed", "rejected"] }).notNull().default("pending"),
  girlReply: text("girl_reply"),
  replyOpening: text("reply_opening"),
  replyDuring: text("reply_during"),
  replyEnding: text("reply_ending"),
  aftercare: text("aftercare"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  clientId: text("client_id").notNull().references(() => users.id),
  girlId: text("girl_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const serviceLogs = sqliteTable("service_logs", {
  id: text("id").primaryKey(),
  girlId: text("girl_id").notNull().references(() => users.id),
  orderId: text("order_id").notNull().references(() => orders.id),
  clientName: text("client_name").notNull().default(""),
  summary: text("summary").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});
