import type { Request, Response } from "express";

export function healthCheck (req: Request, res: Response) {
  res.json({
    status: 'success', 
    message: 'healthCheck running'
  }); 
}