import { AppConfig } from "$lib/config.js";
import { getCompletedObjectives, getObjectives, getRoute, writeRoute } from "$lib/server/db/routes";
import type { Objective, Route } from "$lib/types";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({ params }): Promise<Response> => {
  let route: Route = {};
  const routeId = params.routeId;
  const userId = params.userId;

  let completed = getCompletedObjectives(userId, routeId);

  return json(apiResponse(completed));
};
