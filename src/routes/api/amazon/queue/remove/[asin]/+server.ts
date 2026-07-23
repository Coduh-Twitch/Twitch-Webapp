import {
  PRIVATE_CHATBOT_APP_URL,
  PRIVATE_TWITCH_CLIENT_SECRET,
} from "$env/static/private";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async ({ fetch, params }) => {
  const removedItem = await (
    await fetch(
      `${PRIVATE_CHATBOT_APP_URL}/api/amazon/queue/remove/${params.asin}`,
      {
        method: "POST",
        headers: { key: PRIVATE_TWITCH_CLIENT_SECRET },
      },
    )
  ).json();
  return json(apiResponse(removedItem));
};
