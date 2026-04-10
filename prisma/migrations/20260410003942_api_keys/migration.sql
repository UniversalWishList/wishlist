/*
  Warnings:

  - You are about to drop the column `revokedAt` on the `api_key` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_api_key" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    CONSTRAINT "api_key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_api_key" ("createdAt", "expiresAt", "id", "keyHash", "keyPrefix", "lastUsedAt", "name", "userId") SELECT "createdAt", "expiresAt", "id", "keyHash", "keyPrefix", "lastUsedAt", "name", "userId" FROM "api_key";
DROP TABLE "api_key";
ALTER TABLE "new_api_key" RENAME TO "api_key";
CREATE UNIQUE INDEX "api_key_keyHash_key" ON "api_key"("keyHash");
CREATE INDEX "api_key_userId_idx" ON "api_key"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
