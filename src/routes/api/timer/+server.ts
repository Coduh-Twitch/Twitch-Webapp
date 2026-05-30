import { PRIVATE_CHATBOT_APP_URL } from '$env/static/private'
import { type DBTimer } from '$lib/types';
import { apiResponse } from '$lib/util';
import { json } from '@sveltejs/kit';

export const GET = async ({fetch}): Promise<Response> => {
    let res = await (await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/timer`)).json();
    return json(apiResponse<DBTimer>(res));
}