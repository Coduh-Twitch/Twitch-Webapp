import {
  PRIVATE_CHATBOT_APP_URL,
  PRIVATE_TWITCH_CLIENT_SECRET,
} from "$env/static/private";
import { updateAppConfig } from "$lib/server/db/appConfig";
import type { DBAppConfig } from "$lib/types.js";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async ({ fetch, params }) => {
  let newCount = Number(params.newcount);

  const res = await (
    await fetch(
      `${PRIVATE_CHATBOT_APP_URL}/api/config/set/deaths/${newCount}`,
      { method: "POST", headers: { key: PRIVATE_TWITCH_CLIENT_SECRET } },
    )
  ).json();

  return json(apiResponse<DBAppConfig | null>(res));
};
