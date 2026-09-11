import { AppConfig } from "$lib/config.js";
import { getObjectives, getRoute, getRouteProgress, writeRoute } from "$lib/server/db/routes";
import type { Objective, Route } from "$lib/types";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({ params }): Promise<Response> => {
  const routeId = params.routeId;
  const userId = params.userId;

  let dbRoute = getRoute(routeId);
  if (!dbRoute) dbRoute = writeRoute(routeId, (AppConfig.route_names as Record<string, string>)[routeId], (AppConfig.routes as Record<string, Record<string, Objective[]>>)[routeId]);

  const progress = getRouteProgress(userId, routeId);

  return json(apiResponse(progress));
};
