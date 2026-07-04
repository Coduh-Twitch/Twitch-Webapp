import { json, redirect, type Cookies } from "@sveltejs/kit";
import { AppConfig } from "./config";
import type { ApiError, ApiResponse, TwitchUser } from "./types";
import { getUserFromToken } from "./twitch";
import { refreshToken } from "./auth";
import axios from "axios";
import { PUBLIC_APP_URL } from "$env/static/public";
import { browser } from "$app/environment";

export function serializeJSONCookie<T>(obj: T): string {
  return JSON.stringify(obj);
}

export function deserializeJSONCookie<T>(cookie: string): T {
  return JSON.parse(cookie);
}

export function parseCookie(
  cookie_string: string | null,
  key: string,
): string | null {
  if (!cookie_string) return null;
  let pairs = cookie_string.split(";");
  let splitPairs = pairs.map((cookie) => cookie.split("="));
  let o: { [key: string]: string } = splitPairs.reduce<{
    [key: string]: string;
  }>((obj, cookie) => {
    obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(
      cookie[1].trim(),
    );

    return obj;
  }, {});

  if (!o[key]) return null;
  return o[key];
}

export function apiResponse<T>(
  data: T,
  requester: string | null = null,
  statusCode: number = 0,
  success: boolean = true,
  errorMessage: string | null = null,
): ApiResponse<T> {
  let res: ApiResponse<T> = {
    data: data,
    v: AppConfig.api_version,
  };

  if (requester !== null) res.for = requester;

  if (statusCode > 0) res.status = statusCode;
  if (!success && errorMessage !== null) {
    let error: ApiError = {
      message: errorMessage,
    };

    res.error = error;
  }

  return res;
}

export async function get(
  request: Request,
  cookies: Cookies,
  requireAuth: boolean = true,
): Promise<Response | TwitchUser | null> {
  let failReason = "";
  let statusCode = 200;
  let apiUser = null;

  let requesterId = request.headers.get("x-requester-id") || "0";
  let tokenCookie = cookies.get("token-0") || null;

  let refreshTokenCookie = cookies.get("token-r") || null;

  let currentUser = await getUserFromToken(tokenCookie);

  if (
    (!currentUser || !currentUser.id || !tokenCookie) &&
    refreshTokenCookie !== null
  ) {
    let refreshed = await refreshToken(refreshTokenCookie);
    if (refreshed) {
      let tokenExpiresAt = Date.now() + (refreshed?.expires_in || 0) * 1000;
      let tokenExpiresInSeconds = refreshed.expires_in;
      tokenCookie = refreshed.access_token;
      cookies.set(`token-0`, refreshed.access_token, {
        path: "/",
        expires: new Date(tokenExpiresAt),
        maxAge: tokenExpiresInSeconds,
        httpOnly: true,
        secure: true,
      });
      if (refreshed.refresh_token)
        cookies.set(`token-r`, refreshed.refresh_token, {
          path: "/",
          expires: new Date(tokenExpiresAt),
          maxAge: tokenExpiresInSeconds,
        });
    } else {
      tokenCookie = null;
    }
  }

  if (tokenCookie !== null) {
    apiUser = await getUserFromToken(tokenCookie);
  } else {
    failReason = "Missing authorization";
    statusCode = 401;
    return json(
      apiResponse<null>(null, requesterId, statusCode, false, failReason),
    );
  }

  if (apiUser && requireAuth) {
    return apiUser;
  } else if (requireAuth) {
    return null;
  } else {
    failReason = "Missing authorization";
    statusCode = 401;
    return json(
      apiResponse<null>(null, requesterId, statusCode, false, failReason),
    );
  }
}

var MAX_SAFE_INTEGER = 9007199254740991;

function isSafeNumber(value: number) {
  return typeof value === "number" && Math.abs(value) <= MAX_SAFE_INTEGER;
}

function isFinite(value: number) {
  return !(
    typeof value !== "number" ||
    value !== value ||
    value === Infinity ||
    value === -Infinity
  );
}

var TEN = 10;
var ONE_HUNDRED = 100;
var ONE_THOUSAND = 1000;
var ONE_MILLION = 1000000;
var ONE_BILLION = 1000000000; //         1.000.000.000 (9)
var ONE_TRILLION = 1000000000000; //     1.000.000.000.000 (12)
var ONE_QUADRILLION = 1000000000000000; // 1.000.000.000.000.000 (15)
var MAX = 9007199254740992; // 9.007.199.254.740.992 (15)

var LESS_THAN_TWENTY = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

var TENTHS_LESS_THAN_HUNDRED = [
  "zero",
  "ten",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/**
 * Converts an integer into words.
 * If number is decimal, the decimals will be removed.
 * Credit: https://github.com/marlun78/number-to-words
 * @example toWords(12) => 'twelve'
 * @param {number|string} num
 * @param {boolean} [asOrdinal] - Deprecated, use toWordsOrdinal() instead!
 * @returns {string}
 */
export function toWords(numm: string) {
  var words;
  var num = parseInt(numm, 10);

  if (!isFinite(num)) {
    throw new TypeError(
      "Not a finite number: " + num + " (" + typeof num + ")",
    );
  }
  if (!isSafeNumber(num)) {
    throw new RangeError(
      "Input is not a safe number, it’s either too large or too small.",
    );
  }
  words = generateWords(num);
  return words;
}

function generateWords(num: any, words?: any) {
  var remainder,
    word,
    words = arguments[1];

  // We’re done
  if (num === 0) {
    return !words ? "zero" : words.join(" ").replace(/,$/, "");
  }
  // First run
  if (!words) {
    words = [];
  }
  // If negative, prepend “minus”
  if (num < 0) {
    words.push("minus");
    num = Math.abs(num);
  }

  if (num < 20) {
    remainder = 0;
    word = LESS_THAN_TWENTY[num];
  } else if (num < ONE_HUNDRED) {
    remainder = num % TEN;
    word = TENTHS_LESS_THAN_HUNDRED[Math.floor(num / TEN)];
    // In case of remainder, we need to handle it here to be able to add the “-”
    if (remainder) {
      word += "-" + LESS_THAN_TWENTY[remainder];
      remainder = 0;
    }
  } else if (num < ONE_THOUSAND) {
    remainder = num % ONE_HUNDRED;
    word = generateWords(Math.floor(num / ONE_HUNDRED)) + " hundred";
  } else if (num < ONE_MILLION) {
    remainder = num % ONE_THOUSAND;
    word = generateWords(Math.floor(num / ONE_THOUSAND)) + " thousand,";
  } else if (num < ONE_BILLION) {
    remainder = num % ONE_MILLION;
    word = generateWords(Math.floor(num / ONE_MILLION)) + " million,";
  } else if (num < ONE_TRILLION) {
    remainder = num % ONE_BILLION;
    word = generateWords(Math.floor(num / ONE_BILLION)) + " billion,";
  } else if (num < ONE_QUADRILLION) {
    remainder = num % ONE_TRILLION;
    word = generateWords(Math.floor(num / ONE_TRILLION)) + " trillion,";
  } else if (num <= MAX) {
    remainder = num % ONE_QUADRILLION;
    word = generateWords(Math.floor(num / ONE_QUADRILLION)) + " quadrillion,";
  }

  words.push(word);
  return generateWords(remainder, words);
}
