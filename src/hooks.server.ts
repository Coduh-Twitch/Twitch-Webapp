import { createAppConfig, getAppConfig } from "$lib/server/db/appConfig";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  let appState = getAppConfig();
  if (!appState) createAppConfig();

  // let tokenCookie = event.cookies.get("token-0") || null

  // // event.locals.token = tokenCookie;
  // console.log("TOKEN", tokenCookie)
  //
  //
  if (event.url.pathname.includes("api/tts/speak"))
    event.setHeaders({ "Content-Type": "audio/mpeg" });

  const response = await resolve(event);
  return response;
};
