import { PRIVATE_CHATBOT_APP_URL, PRIVATE_TWITCH_CLIENT_SECRET } from '$env/static/private'
import type { DBClip, DBNotice } from '$lib/types.js';
import { apiResponse } from '$lib/util';
import { json } from '@sveltejs/kit';

export const POST = async ({fetch, request, url}): Promise<Response> => {
    let currentClipId = url.searchParams.get("clip");
    let res = await (await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/clips/finished?current=${currentClipId}`, {method: "POST", headers: {"key": PRIVATE_TWITCH_CLIENT_SECRET}})).json();
    return json(apiResponse<DBClip | null>(res || null));
}