import {
  PRIVATE_CHATBOT_APP_URL,
  PRIVATE_TWITCH_CLIENT_SECRET,
} from "$env/static/private";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async ({ fetch, params, request }) => {
  const data = await request.json();
  console.log("DATA", data);
  const user = await (
    await fetch(
      `${PRIVATE_CHATBOT_APP_URL}/api/users/${params.userId}/addWordScore/${data.word}/${data.revealed_word}`,
      {
        headers: { key: PRIVATE_TWITCH_CLIENT_SECRET },
        method: "POST",
      },
    )
  ).json();
  return json(apiResponse(user || null));
};
