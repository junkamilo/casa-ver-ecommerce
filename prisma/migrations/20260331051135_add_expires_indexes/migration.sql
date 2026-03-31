-- CreateIndex
CREATE INDEX "email_verification_tokens_expires_idx" ON "email_verification_tokens"("expires");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_idx" ON "password_reset_tokens"("expires");

-- CreateIndex
CREATE INDEX "pending_registrations_expires_idx" ON "pending_registrations"("expires");
