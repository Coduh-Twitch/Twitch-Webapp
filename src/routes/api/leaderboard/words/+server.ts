import {
  PRIVATE_CHATBOT_APP_URL,
  PRIVATE_TWITCH_CLIENT_SECRET,
} from "$env/static/private";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({ fetch, url }) => {
  const lb = await (
    await fetch(
      `${PRIVATE_CHATBOT_APP_URL}/api/words/leaderboard${url.searchParams.has("slice") ? `?slice=${url.searchParams.get("slice")}` : ""}`,
      {
        headers: { key: PRIVATE_TWITCH_CLIENT_SECRET },
      },
    )
  ).json();
  return json(apiResponse(lb || []));
};
