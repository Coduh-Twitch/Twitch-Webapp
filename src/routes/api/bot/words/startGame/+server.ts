import {
  PRIVATE_CHATBOT_APP_URL,
  PRIVATE_TWITCH_CLIENT_SECRET,
} from "$env/static/private";
import { AppConfig } from "$lib/config";
import type { DBAppConfig } from "$lib/types";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async () => {
  const data: DBAppConfig = await (
    await fetch(
      `${PRIVATE_CHATBOT_APP_URL}/api/words/startGame/${AppConfig.word_list_bin_id}`,
      {
        headers: { key: PRIVATE_TWITCH_CLIENT_SECRET },
        method: "POST",
      },
    )
  ).json();

  return json(apiResponse(data));
};
