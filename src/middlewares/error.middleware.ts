import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  console.error(`Error caught: `, err);

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((error) => ({
      path: error.path,
      message: error.message
    })); 

    res.status(400).json({
      status: 'error', 
      type: 'ZodValidationError', 
      errors: formattedErrors
    })
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  })
}