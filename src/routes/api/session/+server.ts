import { PRIVATE_TWITCH_CLIENT_SECRET } from '$env/static/private';
import { getSession } from '$lib/server/db/sessions.js';
import { getDatabaseUser } from '$lib/server/db/users';
import { getUserFromToken } from '$lib/twitch';
import type { TwitchUser } from '$lib/types';
import { apiResponse } from '$lib/util'
import { json } from '@sveltejs/kit'

export const GET = async ({url, locals}): Promise<Response> => {

    if(!url.searchParams.has("key")) return json(apiResponse(null, null, 401, false, "Missing API Key"));
    let key = url.searchParams.get("key");
    if(!key || key !== PRIVATE_TWITCH_CLIENT_SECRET) return json(apiResponse(null, null, 401, false, "Invalid API Key"));

    let dbSession = getSession();
    if(!dbSession) return json(apiResponse({user: null, access_token: null}));

    let apiUser = await getUserFromToken(dbSession.access_token);
    
    if(!apiUser) return json(apiResponse({user: null, access_token: null}));

    let session: {user: TwitchUser; access_token: string;} = {
        user: apiUser,
        access_token: dbSession.access_token
    }

    return json(apiResponse(session));
}