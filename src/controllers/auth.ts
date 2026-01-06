import type { Request, Response } from "express";
import { SignUpSchema } from "../schemas/user";
import { hash } from "bcrypt";
import crypto from 'crypto'; 

import { generateAccessToken, generateRefreshToken, verifyJWTToken } from "../lib/jwt";
import { uuidv4 } from "../lib/uuid";
import { prisma } from "../lib/prisma";
import { setTokenAsCookie } from "../lib/cookie";

const cookieOnSecureConnection =
  process.env.COOKIE_ON_SECURE_CONNECTION === "true"; 
const tokenReuseWindowInMS = parseInt(process.env.TOKEN_REUSE_WINDOW_MS?? '5000'); 
const refreshTokenTTL: number = parseInt(process.env.REFRESH_TOKEN_TTL_IN_SECS?? '') || 7*24*60*60;  //7days

export function healthCheck (req: Request, res: Response) {
  res.status(200).json({
    status: 'success', 
    message: 'healthCheck running'
  }); 
}; 

export async function signup (req: Request, res:Response) {
  const payload = await req.body; 

  const parsedPayload = SignUpSchema.parse(payload); 

  const {
    firstName, 
    middleName, 
    lastName, 
    email, 
    password
  } = parsedPayload;

  const jti = uuidv4();
  const userId = uuidv4();  

  const refreshToken = generateRefreshToken(userId, jti); 
  const accessToken = generateAccessToken(userId);
  
  const passwordHashPromise = hash(password, 10);
  const refreshTokenHashPromise = hash(refreshToken, 10); 
  
  const [ passwordHash, refreshTokenHash ] = await Promise.all([
    passwordHashPromise, 
    refreshTokenHashPromise
  ])

  const jtiFamily = crypto.randomBytes(32).toString("hex");

  const user = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        id: userId, 
        firstName, 
        middleName, 
        lastName, 
        email,
        passwordHash
      }
    }); 

    await tx.refreshTokens.create({
      data: {
        jti, 
        jtiFamily, 
        userId: user.id, 
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + refreshTokenTTL * 1000)
      }
    }); 

    return { user, refreshToken}
  })

  setTokenAsCookie(res, 'refresh-token', refreshToken); 
  setTokenAsCookie(res, 'access-token', accessToken);

  res.status(200).json({
    status: 'success', 
    message: 'Sign up success', 
  })
};

export function signin (req: Request, res:Response) {
  res.status(200).json({
    status: 'success', 
    message: 'Sign in success', 
  })
};

export function signout (req: Request, res:Response) {
  res.status(200).json({
    status: 'success', 
    message: 'Sign out success', 
  })
}; 