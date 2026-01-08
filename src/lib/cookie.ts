import type { Response } from "express";

const cookieOnSecureConnection =
  process.env.COOKIE_ON_SECURE_CONNECTION === "true";

const refreshTokenTTL: number = parseInt(process.env.REFRESH_TOKEN_TTL_IN_SECS?? '') || 7*24*60*60;  //7days
const accessTokenTTL: number = parseInt(process.env.ACCESS_TOKEN_TTL_IN_SECS?? '') || 5*60;  //5mins

export const setTokenAsCookie = (
  res:Response, 
  tokenName: 'refresh-token' | 'access-token', 
  token: string
) => {
  res.cookie(tokenName, token, {
    sameSite: 'lax', 
    secure: cookieOnSecureConnection, 
    httpOnly: true,
    maxAge: (tokenName === 'refresh-token')? refreshTokenTTL*1000 : accessTokenTTL*1000  
  })
} 