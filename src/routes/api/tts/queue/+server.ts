import { PRIVATE_CHATBOT_APP_URL } from "$env/static/private";
import { json } from "@sveltejs/kit";

export const GET = async ({ fetch }) => {
  let res = await (
    await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/tts/queue`)
  ).json();

  return json(res || []);
};
