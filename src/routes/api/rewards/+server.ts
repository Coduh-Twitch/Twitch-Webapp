import { getCustomRewards } from "$lib/twitch";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({ cookies }) => {
  const token = cookies.get("token-0") || null;
  console.log("TOKEN COOKIE", token);

  let rewards = await getCustomRewards(token);

  return json(apiResponse(rewards));
};
