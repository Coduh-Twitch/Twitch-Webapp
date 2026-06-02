import { PRIVATE_CHATBOT_APP_URL } from '$env/static/private'
import type { DBClip, DBNotice } from '$lib/types.js';
import { apiResponse } from '$lib/util';
import { json } from '@sveltejs/kit';

export const GET = async ({fetch}): Promise<Response> => {
    let res = await (await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/clips/visible`)).json();
    return json(apiResponse<boolean>(res || false));
}