import type { Request, Response } from "express";

import { GetAllSessionsSchema, SignInSchema, SignUpSchema } from "../schemas/auth.ts";
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

export async function signin (req: Request, res:Response) {
  const payload = await req.body;
  
  const parsedPayload = SignInSchema.parse(payload);

  const context = {
    userAgent: req.headers['user-agent']?? null, 
    ipAddress: req.ip?? null,
  }
  const result = await services.signin(parsedPayload, context); 

  switch (result.type) {
    case 'SUCCESS': 
      setTokenAsCookie(res, 'refresh-token', result.refreshToken); 
      setTokenAsCookie(res, 'access-token', result.accessToken); 
      return res.status(200).json({
        message: 'success'
      })
    case 'INVALID': 
      return res.status(400).json({
        message: 'not successful'
      }); 
  }
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

export async function getAllSessions (req: Request, res: Response) {
  const payload = req.body; 

  const parsedPayload = GetAllSessionsSchema.parse(payload); 

  const result = await services.getAllSessions(parsedPayload); 

  switch (result.type) {
    case 'SUCCESS': 
      return res.status(200).json({
        message: 'success', 
        sessions: result.sessions
      }); 
    case 'INVALID': 
      return res.status(400).json({
        message: 'Sign In failed'
      }); 
  }
}