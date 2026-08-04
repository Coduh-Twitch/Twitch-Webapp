import { getGlobalBadgeById } from "$lib/twitch.js";
import type { TwitchGlobalBadge } from "$lib/types";
import { parseCookie } from "$lib/util.js";
import { json } from "@sveltejs/kit";
import {
  getGlobalBadge,
  createGlobalBadge,
} from "$lib/server/db/globalBadges.js";
import { refreshToken } from "$lib/auth.js";
import { getSession } from "$lib/server/db/sessions.js";

export const GET = async ({ params, request }): Promise<Response> => {
  let tokenCookie = parseCookie(
    request.headers.get("cookie") || null,
    "token-0",
  );
  if (!tokenCookie) {
    let session = getSession();
    if (session) {
      tokenCookie = session.access_token;
    } else return json(null);
  }

  let badgeSetId = params.setId;
  let badgeId = params.badgeId;

  let dbBadge = getGlobalBadge(badgeId, badgeSetId);
  let badge: TwitchGlobalBadge | null;

  if (!dbBadge) {
    badge = await getGlobalBadgeById(badgeSetId, badgeId, tokenCookie);
    if (badge !== null) {
      createGlobalBadge({
        badge_id: badgeId,
        set_id: badgeSetId,
        url: badge.image_url_2x,
      });
    }
  } else {
    badge = {
      id: badgeId,
      click_action: "",
      click_url: "",
      description: "",
      title: "",
      image_url_1x: dbBadge.url,
      image_url_2x: dbBadge.url,
      image_url_4x: dbBadge.url,
    };
  }

  console.log("GLOBAL BADGE", badge);

  return json(badge);
};
