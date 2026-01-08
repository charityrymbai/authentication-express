import { uuidv4 } from "../lib/uuid";
import type { GeTAllSessionsPayload, SignInPayload, SignUpPayload } from "../schemas/auth";
import { generateAccessToken, generateRefreshToken, verifyJWTToken } from "../lib/jwt";
import { compare, hash } from "bcrypt";
import crypto, { type UUID } from 'crypto'; 
import { prisma } from "../lib/prisma";
import { parseDevice } from "../lib/userAgentParser";
import { hashUsingSha256 } from "../lib/crypto";

const refreshTokenTTL: number = parseInt(process.env.REFRESH_TOKEN_TTL_IN_SECS?? '') || 7*24*60*60;  //7days
const tokenReuseWindowInMS = parseInt(process.env.TOKEN_REUSE_WINDOW_MS?? '5000'); 

export const signUp = async (
  payload: SignUpPayload,
  context: {
    userAgent: string | null, 
    ipAddress: string | null
  }
): Promise<{refreshToken: string, accessToken: string}> => {
  const {
    firstName, 
    middleName, 
    lastName, 
    email, 
    password
  } = payload;

  const jti: UUID = uuidv4() as unknown as UUID;
  const userId: UUID = uuidv4() as unknown as UUID;

  const refreshToken = generateRefreshToken(userId, jti); 
  const accessToken = generateAccessToken(userId);
  
  const passwordHash = await hash(password, 10);
  const refreshTokenHash = hashUsingSha256(refreshToken); 

  const jtiFamily = crypto.randomBytes(32).toString("hex");

  await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        id: userId, 
        firstName, 
        middleName, 
        lastName, 
        email,
        passwordHash
      }
    }); 

    await tx.refreshTokens.create({
      data: {
        jti, 
        jtiFamily, 
        userId: user.id, 
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + refreshTokenTTL * 1000), 
        userAgent: context.userAgent?? 'Unknown',
        deviceName: context.userAgent? parseDevice(context.userAgent): 'Unknown',
        ipAddress: context.ipAddress?? 'Unknown'
      }
    }); 

    return { user, refreshToken}
  })

  return { refreshToken, accessToken }; 
}

type SignInSuccess = {
  type: "SUCCESS";
  refreshToken: string;
  accessToken: string; 
}

type SignInInvalid = {
  type: 'INVALID'
}

export const signin = async (
  payload: SignInPayload,
  context: {
    userAgent: string | null, 
    ipAddress: string | null
  }): Promise<
  SignInSuccess | SignInInvalid
> => { 
  const user = await prisma.users.findUnique({
    where: {
      email: payload.email, 
    }
  }); 

  if (!user) {
    return { type: 'INVALID' }; 
  } 

  console.log('USER_ID: ', user.id); 

  const isPasswordValid = await compare(payload.password, user.passwordHash); 

  if (!isPasswordValid) {
    return { type: 'INVALID' }; 
  } 

  const newJti: UUID = uuidv4() as unknown as UUID; 
  const userId: UUID = user.id as unknown as UUID;
  const jtiFamily = crypto.randomBytes(32).toString("hex");

  const refreshToken = generateRefreshToken(userId, newJti)
  const accessToken = generateAccessToken(userId); 

  const refreshTokenHash = hashUsingSha256(refreshToken); 

  await prisma.refreshTokens.create({
    data: {
      jti: newJti, 
      jtiFamily, 
      userId, 
      tokenHash: refreshTokenHash, 
      expiresAt: new Date(Date.now() + refreshTokenTTL * 1000), 
      userAgent: context.userAgent?? 'Unknown', 
      deviceName: context.userAgent? parseDevice(context.userAgent): 'Unknown', 
      ipAddress: context.ipAddress?? 'Unknown'
    }
  })

  return { 
    type: 'SUCCESS', 
    refreshToken, 
    accessToken
   }
}

type RefreshSuccess = {
  type: "SUCCESS";
  refreshToken: string;
  accessToken: string;
};

type RefreshDuplicate = {
  type: "DUPLICATE";
};

type RefreshInvalid = {
  type: "INVALID";
};

export const refresh = async (refreshToken: string): Promise<
  RefreshSuccess | RefreshDuplicate | RefreshInvalid
> => {
  const tokenPayload = verifyJWTToken(refreshToken); 

  const token = await prisma.refreshTokens.findUnique({
    where: {
      jti: tokenPayload.jti, 
    }
  })

  if (!token) {
    return { type: 'INVALID' } 
  } else if (!token.isRevoked) {
    const newJti: UUID = uuidv4() as unknown as UUID; 
    const newRefreshToken = generateRefreshToken(
      tokenPayload.userId as unknown as UUID, newJti as unknown as UUID); 

    const tokenHash = hashUsingSha256(newRefreshToken); 
    
    const accessToken = generateAccessToken(tokenPayload.userId as unknown as UUID); 

    await prisma.$transaction(async (tx) => {
      // old one revoked
      await tx.refreshTokens.update({
        where: {
          jti: tokenPayload.jti
        }, 
        data: {
          isRevoked: true, 
          revokedAt: new Date()
        }
      })
      // new refresh token generation
      await tx.refreshTokens.create({
        data: {
          userId: token.userId,
          tokenHash, 
          jti: newJti, 
          jtiFamily: token.jtiFamily, 
          expiresAt: new Date(Date.now() + refreshTokenTTL * 1000)
        }
      })
    })
    return { 
      type: 'SUCCESS', 
      refreshToken,
      accessToken
    } 
  }

  const isRecentlyRevoked =
    token.isRevoked &&
    token.revokedAt &&
    Date.now() - token.revokedAt.getTime() < tokenReuseWindowInMS;

  if (isRecentlyRevoked) {
    return { type: 'DUPLICATE' }; 
  } 
    
  console.log(`Suspicious activity for user = ${token.userId}. Revoking all tokens with same family...`); 
  await prisma.refreshTokens.updateMany({
    where: {
      jtiFamily: token.jtiFamily, 
      revokedAt: null
    }, 
    data: {
      isRevoked: true, 
      revokedAt: new Date()
    }
  })

  return { type: 'INVALID' };  
}

export type Session = {
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date
};

type GetAllSessionsSuccess = {
  type: 'SUCCESS', 
  sessions: Session[], 
}

type GetAllSessionsInvalid = {
  type: 'INVALID' 
}


export const getAllSessions = async (payload: GeTAllSessionsPayload): Promise<
  GetAllSessionsSuccess | GetAllSessionsInvalid
> => {
  if (!payload.userId) {
    return { type: 'INVALID' }; 
  }
  const rawSessions = await prisma.refreshTokens.findMany({
    where: {
      userId: payload.userId,
      isRevoked: false
    },
    select: {
      deviceName: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true
    }
  });

  const validSince = Date.now() - refreshTokenTTL * 1000;

  const sessions = rawSessions.filter(
    s => s.createdAt.getTime() > validSince
  );

  return {
    type: 'SUCCESS', 
    sessions
  }
};
