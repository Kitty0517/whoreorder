import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["client", "girl"] }).notNull(),
  displayName: text("display_name").notNull(),
  coins: integer("coins").notNull().default(1000),
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
  photoUrl: text("photo_url").notNull().default(""),
  voiceUrl: text("voice_url").notNull().default(""),
  liveOn: integer("live_on").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  showPublicReviews: integer("show_public_reviews").notNull().default(1),
  totalOrders: integer("total_orders").notNull().default(0),
  avgRating: integer("avg_rating").notNull().default(0),
  tonightPersona: text("tonight_persona").notNull().default(""),
  tonightBody: text("tonight_body").notNull().default(""),
  tonightAllowed: text("tonight_allowed").notNull().default(""),
  tonightOpening: text("tonight_opening").notNull().default(""),
  tonightContract: text("tonight_contract").notNull().default("obey"),
  clockOutNote: text("clock_out_note").notNull().default(""),
  bodyMenu: text("body_menu").notNull().default("{}"),
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
  bodyAnchor: text("body_anchor").notNull().default(""),
  contract: text("contract").notNull().default("obey"),
  part: text("part").notNull().default(""),
  depth: text("depth").notNull().default(""),
  partName: text("part_name").notNull().default(""),
  extraPay: integer("extra_pay").notNull().default(0),
  extraDemand: text("extra_demand").notNull().default(""),
  extraStatus: text("extra_status").notNull().default("none"),
  status: text("status", { enum: ["pending", "accepted", "serving", "completed", "rejected"] }).notNull().default("pending"),
  girlReply: text("girl_reply"),
  replyOpening: text("reply_opening"),
  replyDuring: text("reply_during"),
  replyEnding: text("reply_ending"),
  aftercare: text("aftercare"),
  sentOpening: integer("sent_opening").notNull().default(0),
  sentDuring: integer("sent_during").notNull().default(0),
  sentEnding: integer("sent_ending").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  clientId: text("client_id").notNull().references(() => users.id),
  girlId: text("girl_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  obedient: integer("obedient").notNull().default(5),
  filthy: integer("filthy").notNull().default(5),
  listen: integer("listen").notNull().default(5),
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

export const wishlists = sqliteTable("wishlists", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  girlId: text("girl_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const walletTxns = sqliteTable("wallet_txns", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const liveMessages = sqliteTable("live_messages", {
  id: text("id").primaryKey(),
  girlId: text("girl_id").notNull(),
  userId: text("user_id").notNull(),
  displayName: text("display_name").notNull().default(""),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const plazaPosts = sqliteTable("plaza_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull().default("client"),
  displayName: text("display_name").notNull().default(""),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// bodyMenu JSON lives on girl_profiles.body_menu after migration
