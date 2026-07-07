import { getCustomRewards } from "$lib/twitch";
import type { TwitchCustomReward } from "$lib/types";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({ cookies }): Promise<Response> => {
  const token = cookies.get("token-0") || null;
  console.log("TOKEN COOKIE", token);

  let rewards = await getCustomRewards(token);
  console.log("REWARDS", rewards);

  return json(
    apiResponse<TwitchCustomReward[]>(
      rewards
        .filter((r) => r.title.toLowerCase().includes("sound alert"))
        .sort((a, b) => a.cost - b.cost),
    ),
  );
};
