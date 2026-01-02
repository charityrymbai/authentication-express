import type { Request, Response } from "express";

export function healthCheck (req: Request, res: Response) {
  res.status(200).json({
    status: 'success', 
    message: 'healthCheck running'
  }); 
}; 

export function signup (req: Request, res:Response) {
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