import { z } from 'zod'; 

export const SignUpSchema = z.object({
  firstName: z.string().min(1).max(50),
  middleName: z.string().max(50).optional(), 
  lastName: z.string().min(1).max(50), 

  email: z.email(),
  password: z.string().min(1).max(50)
}); 

export type SignUpPayload =  z.infer<typeof SignUpSchema>; 

export const SignInSchema = z.object({
  email: z.email(), 
  password: z.string().min(1).max(50), 
}); 

export type SignInPayload = z.infer<typeof SignInSchema>; 

export const GetAllSessionsSchema = z.object({
  userId: z.uuid(),
}); 

export type GeTAllSessionsPayload = z.infer<typeof GetAllSessionsSchema>; 