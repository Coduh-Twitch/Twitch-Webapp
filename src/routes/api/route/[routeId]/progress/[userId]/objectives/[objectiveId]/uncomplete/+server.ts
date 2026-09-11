import { getRoute, unCompleteObjective } from "$lib/server/db/routes";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async ({ params }): Promise<Response> => {
  const routeId = params.routeId;
  const userId = params.userId;
  const objectiveId = params.objectiveId;

  let dbRoute = getRoute(routeId);
  if (!dbRoute) return json(apiResponse(false));

  unCompleteObjective(userId, routeId, objectiveId);

  return json(apiResponse(true));
};
