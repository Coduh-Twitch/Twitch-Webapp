import { refreshToken } from '$lib/auth.js';
import { getSession, updateSession } from '$lib/server/db/sessions.js';
import { getDatabaseUser } from '$lib/server/db/users.js';
import { getUserById, getUserByLogin, getUserFromToken } from '$lib/twitch.js';
import type { TwitchUser } from '$lib/types.js';
import { apiResponse, get, parseCookie } from '$lib/util.js';
import { json } from '@sveltejs/kit';
import type { Auth } from 'duckylib';



export const GET = async ({ cookies, params, request }): Promise<Response> => {
    let tokenCookie = cookies.get("token-0") || null;
    let userId: string | null = params.userId;
    let failReason = "";
    let statusCode = 200;
    let apiUser: TwitchUser | null = null;

    let response = await get(request, cookies);
    if (response instanceof Response) return response;
    apiUser = response as TwitchUser | null;

    let requesterId = apiUser?.id;


    if (userId === "@me") {
        if (apiUser !== null) {
            userId = apiUser.id
        } else {
            userId = null;
            failReason = "Current user not found"
            statusCode = 400;
        }
    }

    if (userId !== null) {
        if (!tokenCookie) {
            let session = getSession();
            if (session && session.refresh_token) {
                let refreshed = await refreshToken(session.refresh_token);
                if (refreshed) {
                    let token: Auth.AccessToken = refreshed;
                    let tokenExpiresAt = Date.now() + ((token?.expires_in || 0) * 1000);
                    let tokenUser = await getUserFromToken(token.access_token);

                    if(tokenUser) {
                        console.log(`[DEBUG] Refreshed token for user ${tokenUser.display_name}`)
                        tokenCookie = refreshed.access_token;
                        updateSession({ access_token: token.access_token, expires_at: tokenExpiresAt, user_id: tokenUser.id, refresh_token: token.refresh_token})
                    }
                }
            }
        }

        let split = userId.split("");

        let dbUser = null;
        if (!Number.isNaN(Number(userId))) {
            dbUser = await getUserById(userId, tokenCookie);
        } else {
            dbUser = await getUserByLogin(userId, tokenCookie);
        }

        if (dbUser !== null) {
            statusCode = 200;

            return json(apiResponse<TwitchUser>(dbUser, requesterId, statusCode))
        } else {
            failReason = "User not found"
            statusCode = 400;
            return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
        }
    } else {

        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }
}