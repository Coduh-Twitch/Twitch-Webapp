import { PRIVATE_SPOOFIFY_APP_URL } from '$env/static/private'
import { apiResponse } from '$lib/util';
import { json } from '@sveltejs/kit';

export const GET = async ({fetch}): Promise<Response> => {
    let spoofifyConfig = await (await fetch(`${PRIVATE_SPOOFIFY_APP_URL}/api/config`)).json();
    if(!spoofifyConfig || !spoofifyConfig.id) return json(apiResponse(null));

    return json(apiResponse(spoofifyConfig));
}