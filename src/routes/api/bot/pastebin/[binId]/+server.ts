import { PRIVATE_CHATBOT_APP_URL } from "$env/static/private";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({ fetch, params }) => {
  const str = await (
    await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/pastebin/${params.binId}`)
  ).text();

  return json(apiResponse(str));
};
