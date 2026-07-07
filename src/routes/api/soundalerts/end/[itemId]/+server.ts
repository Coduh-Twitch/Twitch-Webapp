import { PRIVATE_CHATBOT_APP_URL } from "$env/static/private";
import { json } from "@sveltejs/kit";

export const POST = async ({ request, fetch, params }): Promise<Response> => {
  let res = await (
    await fetch(
      `${PRIVATE_CHATBOT_APP_URL}/api/soundalerts/end/${params.itemId}`,
    )
  ).json();

  return json(res);
};
