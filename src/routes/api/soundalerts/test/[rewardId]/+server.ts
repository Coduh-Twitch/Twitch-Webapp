import {
  PRIVATE_CHATBOT_APP_URL,
  PRIVATE_TWITCH_CLIENT_SECRET,
} from "$env/static/private";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async ({ fetch, params }) => {
  let rewardId = params.rewardId;
  const test = await (
    await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/soundalerts/test/${rewardId}`, {
      headers: { key: PRIVATE_TWITCH_CLIENT_SECRET },
      method: "POST",
    })
  ).json();
  return json(apiResponse(test || null));
};
