-- Add expiresAt column to TrainReports table
ALTER TABLE "TrainReports"
ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Create index on expiresAt for better query performance
CREATE INDEX IF NOT EXISTS "TrainReports_expiresAt_idx" ON "TrainReports"("expiresAt");

-- Create index on reportedAt for better query performance
CREATE INDEX IF NOT EXISTS "TrainReports_reportedAt_idx" ON "TrainReports"("reportedAt");