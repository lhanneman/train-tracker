ALTER TABLE "TrainReports" ADD COLUMN IF NOT EXISTS "crossingId" TEXT;

CREATE INDEX IF NOT EXISTS "TrainReports_crossingId_reportedAt_idx"
  ON "TrainReports"("crossingId", "reportedAt");
CREATE INDEX IF NOT EXISTS "TrainReports_userIpAddress_reportedAt_idx"
  ON "TrainReports"("userIpAddress", "reportedAt");
