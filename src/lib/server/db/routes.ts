import type { Objective, Route } from "$lib/types"
import { and, eq } from "drizzle-orm"
import { db } from "."
import { route_objectives, route_progress, routes } from "./schema"

export const writeRoute = (id: string, name: string, route: Record<string, Objective[]>): typeof routes.$inferInsert => {
  let objectives: (typeof route_objectives.$inferInsert)[] = []
  console.log("ROUTE", route)
  for (const objs of Object.values(route)) {
    console.log("OBJS", objs)
    for (const objective of objs) {
      console.log("mapping objective", objective)
      objectives.push({
        route_id: id,
        description: objective.description,
        name: objective.name,
        objective_id: objective.id,
        order: objective.order,
        category_id: objective.categoryId,
        category_name: objective.categoryName
      })
    }
  }

  for (const objective of objectives) {

    let obj = db.select().from(route_objectives).where(eq(route_objectives.objective_id, objective.objective_id)).get() || null;
    if (!obj) {
      db.insert(route_objectives).values(objective).returning().get()
    } else {
      db.update(route_objectives).set(objective).returning().get()
    }
  }

  return db.insert(routes).values({ category_id: id, category_name: name }).returning().get();
}

export const getRoute = (id: string): typeof routes.$inferInsert | null => {
  return db.select().from(routes).where(eq(routes.category_id, id)).get() || null;
}

export const getObjectives = (routeId: string): (typeof route_objectives.$inferInsert)[] => {
  return db.select().from(route_objectives).where(eq(route_objectives.route_id, routeId)).all() || [];
}

export const getObjective = (routeId: string, objectiveId: string): typeof route_objectives.$inferInsert | null => {
  return db.select().from(route_objectives).where(and(eq(route_objectives.route_id, routeId), eq(route_objectives.objective_id, objectiveId))).get() || null;
}

export const getCompletedObjectives = (userId: string, routeId: string): (typeof route_objectives.$inferInsert)[] => {
  let toReturn: (typeof route_objectives.$inferInsert)[] = [];
  for (const obj of db.select().from(route_progress).where(and(eq(route_progress.user_id, userId), eq(route_progress.completed, true), eq(route_progress.route_id, routeId))).all() || []) {
    let o = getObjective(routeId, obj.objective_id);
    if(o) toReturn.push(o);
  }

  return toReturn;
}

export const completeObjective = (userId: string, routeId: string, objectiveId: string): typeof route_progress.$inferInsert => {
  const prog = db.select().from(route_progress).where(and(eq(route_progress.user_id, userId), eq(route_progress.route_id, routeId), eq(route_progress.objective_id, objectiveId))).get() || null;
  if (!prog) {
    return db.insert(route_progress).values({ completed: true, completed_at: new Date(), objective_id: objectiveId, user_id: userId, route_id: routeId }).returning().get();
  } else return db.update(route_progress).set({ completed: true, completed_at: new Date() }).where(and(eq(route_progress.user_id, userId), eq(route_progress.route_id, routeId), eq(route_progress.objective_id, objectiveId))).returning().get();
}

export const unCompleteObjective = (userId: string, routeId: string, objectiveId: string): typeof route_progress.$inferInsert => {
  const prog = db.select().from(route_progress).where(and(eq(route_progress.user_id, userId), eq(route_progress.route_id, routeId), eq(route_progress.objective_id, objectiveId))).get() || null;
  if (!prog) {
    return db.insert(route_progress).values({ completed: false, objective_id: objectiveId, user_id: userId, route_id: routeId }).returning().get();
  } else return db.update(route_progress).set({ completed: false }).where(and(eq(route_progress.user_id, userId), eq(route_progress.route_id, routeId), eq(route_progress.objective_id, objectiveId))).returning().get();
}

export const getRouteProgress = (userId: string, routeId: string): { route: typeof routes.$inferInsert | null, progressPercentage: number; } => {
  const route = getRoute(routeId);
  if (!route) return { route: null, progressPercentage: 0 };

  const objectives = getObjectives(routeId);
  if (objectives.length <= 0) return { route, progressPercentage: 0 };

  let completed = getCompletedObjectives(userId, routeId);
  if (completed.length <= 0) return { route, progressPercentage: 0 };

  const percentage = Math.floor((completed.length / objectives.length) * 100);

  return { route, progressPercentage: percentage };
}
