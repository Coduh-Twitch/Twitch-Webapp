import { refreshAll } from "$app/navigation";
import { PUBLIC_TWITCH_CHANNEL_ID } from "$env/static/public";
import { refreshToken } from "$lib/auth";
import { createAppConfig, getAppConfig } from "$lib/server/db/appConfig";
import { getSession } from "$lib/server/db/sessions";
import { getModeratedChannels, getUserFromToken } from "$lib/twitch";
import type { Handle } from "@sveltejs/kit";
import { getUserData, setUserData } from "duckylib";

export const handle: Handle = async ({ event, resolve }) => {
  let appState = getAppConfig();
  if (!appState) createAppConfig();

  // let tokenCookie = event.cookies.get("token-0") || null

  // // event.locals.token = tokenCookie;
  // console.log("TOKEN", tokenCookie)
  //
  // console.log(event.request.url);
  if (event.url.pathname.includes("api/tts/speak"))
    event.setHeaders({
      "Content-Type": "audio/mp3",
      "Cache-Control": "no-store",
    });

  let session = getSession();
  if (
    !event.cookies.get("token-0") ||
    event.cookies.get("token-0") !== session?.access_token
  ) {
    if (session) {
      if (session.user_id === PUBLIC_TWITCH_CHANNEL_ID) {
        event.cookies.set("token-0", session.access_token, { path: "/" });
        if (session.refresh_token)
          event.cookies.set("token-r", session.refresh_token, { path: "/" });
      }
    }
  }
  if (event.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  // else if (event.cookies.get("token-0")) {
  //   const tokenUser = await getUserFromToken(
  //     event.cookies.get("token-0") || null,
  //   );
  //   if (!tokenUser) {
  //     let rt = event.cookies.get("token-r");
  //     if (rt) {
  //       const refreshed = await refreshToken(rt);
  //       if (refreshed) {
  //         event.cookies.set("token-0", refreshed.access_token, { path: "/" });
  //         if (refreshed.refresh_token)
  //           event.cookies.set("token-r", refreshed.refresh_token, {
  //             path: "/",
  //           });
  //       }
  //     } else {
  //       event.cookies.delete("token-0", { path: "/" });
  //       try {
  //         setUserData(null);
  //         await refreshAll();
  //       } catch (e) {}
  //     }
  //   }
  // }

  const response = await resolve(event);
  response.headers.append("Access-Control-Allow-Origin", "*");
  return response;
};
