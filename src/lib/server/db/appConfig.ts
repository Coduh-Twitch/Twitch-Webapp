import type { DBAppConfig } from "$lib/types";
import { eq } from "drizzle-orm";
import { db } from ".";
import { app_config, guessed_words } from "./schema";

export const createAppConfig = () => {
  let ac = getAppConfig() as any;
  if (!ac) return db.insert(app_config).values({}).returning().get();
  if (ac)
    return db
      .update(app_config)
      .set({})
      .where(eq(app_config.id, ac.id))
      .returning()
      .get();
};

export const getAppConfig = (): typeof app_config.$inferInsert | null => {
  return db.select().from(app_config).all()?.[0] || null;
};

export const updateAppConfig = (
  data: typeof app_config.$inferInsert,
): typeof app_config.$inferInsert | null => {
  let ac = getAppConfig() as any;
  let toReturn: typeof app_config.$inferInsert | null = null;

  if (!ac)
    toReturn = db.insert(app_config).values(data).returning().get() || null;
  if (ac)
    toReturn =
      db
        .update(app_config)
        .set(data)
        .where(eq(app_config.id, ac.id))
        .returning()
        .get() || null;

  return toReturn;
};

export const getGuessedWords = (): string[] => {
  let ac = getAppConfig() as any;
  return (
    db
      .select()
      .from(guessed_words)
      .where(eq(guessed_words.config_id, ac.id))
      .all()
      .map((e) => e.word) || []
  );
};

export const addGuessedWord = (word: string): string[] => {
  let ac = getAppConfig() as any;
  db.insert(guessed_words)
    .values({ config_id: ac.id, word: word })
    .returning()
    .get();
  return (
    db
      .select()
      .from(guessed_words)
      .where(eq(guessed_words.config_id, ac.id))
      .all()
      .map((e) => e.word) || []
  );
};

export const clearGuessedWords = () => {
  let ac = getAppConfig() as any;
  return db
    .delete(guessed_words)
    .where(eq(guessed_words.config_id, ac.id))
    .all();
};
