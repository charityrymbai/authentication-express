import crypto from 'crypto'; 

export const hashUsingSha256 = (token: string) => {
  return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
}