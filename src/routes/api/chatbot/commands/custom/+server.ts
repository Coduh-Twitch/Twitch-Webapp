import { PRIVATE_CHATBOT_APP_URL } from '$env/static/private'
import type { ChatCommand, CustomCommand } from '$lib/types';
import { apiResponse } from '$lib/util.js';
import { json } from '@sveltejs/kit';

export const GET = async ({fetch}): Promise<Response> => {
    let res: {commands: CustomCommand[]} = await (await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/custom-commands`)).json();
    if(!res.commands) return json(apiResponse<CustomCommand[]>([]));
    return json(apiResponse<CustomCommand[]>(res.commands));
}