import type { UUID } from 'crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken'; 

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set");
}

const accessTokenTTL: number = parseInt(process.env.ACCESS_TOKEN_TTL_IN_SECS?? '') || 5*60; // 5mins  
const refreshTokenTTL: number = parseInt(process.env.REFRESH_TOKEN_TTL_IN_SECS?? '') || 7*24*60*60;  //7days

export const generateJWTToken = (data: any, expiresInMs: number) => {
  return jwt.sign({
    data: data
  }, jwtSecret, { expiresIn: expiresInMs });
}

export const generateAccessToken = (userId: UUID) => {
  return generateJWTToken({userId}, accessTokenTTL); 
}

export const generateRefreshToken = (
  userId: UUID, 
  jti: UUID
) => {
  return generateJWTToken({
    userId, jti
  }, refreshTokenTTL); 
}

interface RefreshTokenPayload extends jwt.JwtPayload {
  userId: string;
  jti: string; 
}

export const verifyJWTToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, jwtSecret) as RefreshTokenPayload;
};