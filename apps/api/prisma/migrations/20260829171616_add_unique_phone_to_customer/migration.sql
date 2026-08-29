/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- Remove duplicate phone values before creating unique index
-- Keep only the most recently created customer for each duplicate phone
DELETE FROM "Customer"
WHERE id NOT IN (
  SELECT DISTINCT ON (phone) id
  FROM "Customer"
  WHERE phone IS NOT NULL
  ORDER BY phone, "createdAt" DESC
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
