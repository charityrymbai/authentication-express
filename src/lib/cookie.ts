import type { Response } from "express";

const cookieOnSecureConnection =
  process.env.COOKIE_ON_SECURE_CONNECTION === "true";

export const setTokenAsCookie = (
  res:Response, 
  tokenName: string, 
  token: string
) => {
  res.cookie(tokenName, token, {
    sameSite: 'lax', 
    secure: cookieOnSecureConnection, 
    httpOnly: true
  })
} 