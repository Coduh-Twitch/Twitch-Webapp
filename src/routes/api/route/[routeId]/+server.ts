import { AppConfig } from "$lib/config.js";
import { getObjectives, getRoute, writeRoute } from "$lib/server/db/routes";
import type { Objective, Route } from "$lib/types";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({ params }): Promise<Response> => {
  let route: Route = {};
  const routeId = params.routeId;

  let dbRoute = getRoute(routeId);
  if (!dbRoute) dbRoute = writeRoute(routeId, (AppConfig.route_names as Record<string, string>)[routeId], (AppConfig.routes as Record<string, Record<string, Objective[]>>)[routeId]);

  const objectives = getObjectives(routeId);

  for (const objective of objectives) {
    const obj = {
      categoryId: objective.category_id,
      categoryName: objective.category_name,
      description: objective.description,
      id: objective.objective_id,
      name: objective.name,
      order: objective.order,
    };
    route[objective.category_id] = [
      ...(route?.[objective.category_id] || []),
      obj,
    ];
  }

  return json(apiResponse({route: dbRoute, objectives}));
};
