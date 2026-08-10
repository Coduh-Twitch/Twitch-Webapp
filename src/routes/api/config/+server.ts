import { getAppConfig } from "$lib/server/db/appConfig";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async () => {
  const ac = getAppConfig();
  return json(apiResponse(ac));
};
