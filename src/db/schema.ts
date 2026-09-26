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
  tags: text("tags").notNull().default("[]"), // JSON array
  price: integer("price").notNull().default(200), // 一次服务价格
  status: text("status", { enum: ["idle", "busy", "off"] }).notNull().default("idle"),
  avatarEmoji: text("avatar_emoji").notNull().default("🖤"),
  totalOrders: integer("total_orders").notNull().default(0),
  avgRating: integer("avg_rating").notNull().default(0), // 0-50 存 10倍
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => users.id),
  girlId: text("girl_id").notNull().references(() => users.id),
  fantasyType: text("fantasy_type").notNull(),
  fantasyDetail: text("fantasy_detail").notNull(),
  tone: text("tone").notNull(),
  status: text("status", { enum: ["pending", "accepted", "serving", "completed", "rejected"] }).notNull().default("pending"),
  girlReply: text("girl_reply"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  clientId: text("client_id").notNull().references(() => users.id),
  girlId: text("girl_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});
