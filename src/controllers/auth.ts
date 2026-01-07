import type { Request, Response } from "express";

import { SignUpSchema } from "../schemas/user";
import { setTokenAsCookie } from "../lib/cookie";
import * as  services from '../services/auth.ts'; 

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

  const context = {
    userAgent: req.headers['user-agent']?? null, 
    ipAddress: req.ip?? null,
  }

  const { accessToken, refreshToken } = await services.signUp(
    parsedPayload, context
  ); 

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

export async function refreshAccessToken (req: Request, res:Response) {
  const refreshToken = req.cookies['refresh-token']; 

  const result = await services.refresh(refreshToken); 

  switch (result.type) {
    case 'SUCCESS': 
      setTokenAsCookie(res, 'refresh-token', result.refreshToken); 
      setTokenAsCookie(res, 'access-token', result.accessToken); 
      return res.status(200).json({
        message: 'success'
      }); 
    case 'DUPLICATE':
      return res.status(200).json({
        message: 'Duplicate Token Refresh Request'
      }); 
    case 'INVALID': 
    default:
      return res.status(400).json({
        message: 'Invalid Token Refresh Request'
      })
  }
}