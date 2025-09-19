/*
  Warnings:

  - You are about to drop the column `drink` on the `postagem` table. All the data in the column will be lost.
  - Added the required column `drinkId` to the `postagem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "Dname" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "rating" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_postagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legenda" TEXT,
    "datePublished" DATETIME NOT NULL,
    "photoPath" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drinkId" TEXT NOT NULL,
    CONSTRAINT "postagem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "postagem_drinkId_fkey" FOREIGN KEY ("drinkId") REFERENCES "produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_postagem" ("datePublished", "id", "legenda", "photoPath", "userId") SELECT "datePublished", "id", "legenda", "photoPath", "userId" FROM "postagem";
DROP TABLE "postagem";
ALTER TABLE "new_postagem" RENAME TO "postagem";
CREATE UNIQUE INDEX "postagem_id_key" ON "postagem"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "produto_id_key" ON "produto"("id");
