
import { completeObjective, getRoute } from "$lib/server/db/routes";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async ({ params }): Promise<Response> => {
  const routeId = params.routeId;
  const userId = params.userId;
  const objectiveId = params.objectiveId;

  let dbRoute = getRoute(routeId);
  if (!dbRoute) return json(apiResponse(false));

  completeObjective(userId, routeId, objectiveId);

  return json(apiResponse(true));
};
