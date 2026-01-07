-- Drop constraints
ALTER TABLE "RefreshTokens" DROP CONSTRAINT "RefreshTokens_userId_fkey";
ALTER TABLE "RefreshTokens" DROP CONSTRAINT "RefreshTokens_pkey";
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey";

-- Cast columns safely
ALTER TABLE "RefreshTokens"
ALTER COLUMN "jti" TYPE UUID USING "jti"::uuid;

ALTER TABLE "RefreshTokens"
ALTER COLUMN "userId" TYPE UUID USING "userId"::uuid;

ALTER TABLE "Users"
ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- Recreate constraints
ALTER TABLE "RefreshTokens"
ADD CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("jti");

ALTER TABLE "Users"
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");

ALTER TABLE "RefreshTokens"
ADD CONSTRAINT "RefreshTokens_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "Users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
