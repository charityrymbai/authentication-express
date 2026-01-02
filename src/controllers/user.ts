import type { Request, Response } from "express";

export function healthCheck (req: Request, res: Response) {
  res.status(200).json({
    status: 'success', 
    message: 'healthCheck running', 
  }); 
}

export function updateUser (req: Request, res: Response) {
  res.status(200).json({
    status: 'success', 
    message: 'updated user success', 
  })
}