import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export interface DBAccount {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
}

export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  username: text("username").notNull(),
  avatarUrl: text("avatarUrl").notNull(),
  role: integer("role").notNull(),
});

export const app_config = sqliteTable("app_config", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull(),
  access_token: text("access_token").notNull(),
  refresh_token: text("refresh_token"),
  expires_at: integer("expires_at").notNull(),
});

export const global_badges = sqliteTable("global_badges", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  badge_id: text("badge_id").notNull(),
  set_id: text("set_id").notNull(),
  url: text("url").notNull(),
});

export const channel_badges = sqliteTable("channel_badges", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  channel_id: text("channel_id").notNull(),
  badge_id: text("badge_id").notNull(),
  set_id: text("set_id").notNull(),
  url: text("url").notNull(),
});

export const guessed_words = sqliteTable("guessed_words", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  config_id: text("config_id").notNull(),
  word: text("word").notNull(),
});
