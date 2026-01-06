import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken";
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

    return res.status(400).json({
      status: 'error', 
      type: 'ZodValidationError', 
      errors: formattedErrors
    })
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      console.log('ERROR LOGGING: ', err, 'ERROR ENDED'); 
      if (err.meta?.target?.includes("email")) {
        return res.status(409).json({
          status: 'error', 
          error_type: "Conflict",
          message: "Email already registered"
        }); 
      }
    }
  } else if (err instanceof TokenExpiredError ||
    err instanceof JsonWebTokenError ||
    err instanceof NotBeforeError
   ) {
    return res.status(401).json({
      status: 'error', 
      type: err.name, 
      message: err.message
    })
  }
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  })
}