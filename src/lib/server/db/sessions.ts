
import { eq } from "drizzle-orm";
import { db } from ".";
import { sessions } from "./schema";

export const updateSession = (data: typeof sessions.$inferInsert): typeof sessions.$inferInsert => {
    let session = db.select().from(sessions).all()?.[0] || null;
    if(session) {
        return db.update(sessions).set(data).where(eq(sessions.id, session.id)).returning().get();
    } else return db.insert(sessions).values(data).returning().get();
}

export const getSession = (): typeof sessions.$inferInsert | null => {
    let session: typeof sessions.$inferInsert | null = db.select().from(sessions).all()?.[0] || null;
    return session;
}