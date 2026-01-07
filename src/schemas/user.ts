import { z } from 'zod'; 

export const SignUpSchema = z.object({
  firstName: z.string().min(1).max(50),
  middleName: z.string().max(50).optional(), 
  lastName: z.string().min(1).max(50), 

  email: z.email(),
  password: z.string().min(1).max(50)
}); 

export type SignUpPayload =  z.infer<typeof SignUpSchema>; 