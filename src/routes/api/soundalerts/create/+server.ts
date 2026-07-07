import { PRIVATE_CHATBOT_APP_URL } from "$env/static/private";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async ({ request, cookies, fetch }): Promise<Response> => {
  let tokenCookie = cookies.get("token-0") || null;
  if (!tokenCookie)
    return json(apiResponse(null, null, 403, false, "Invalid Token"));

  const body = await request.json();
  const url = body.url;
  const name = body.name;
  const cost = body.cost;
  const color = body.color;

  console.log("BODY", JSON.stringify(body));

  if (!url || !name || !cost || !color)
    return json(apiResponse(null, null, 403, false, "Invalid Data Provided"));

  console.log("valid data provided");

  const r = await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/soundalerts/create`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  if (!r.ok)
    return json(
      apiResponse(null, null, 403, false, "Outbound request failed."),
    );

  try {
    let res = await r.json();
    console.log("SERVER RESPONSE", res);
    if (!res || !res?.data)
      return json(
        apiResponse(
          null,
          null,
          403,
          false,
          "Received failure response from server",
        ),
      );

    console.log("RETURNING");

    return json(apiResponse(res));
  } catch (e: any) {
    console.log("FAILED CREATION", e);
    return json(
      apiResponse(null, null, 403, false, "Invalid data received from server."),
    );
  }
};
