-- AddColumn confirmationEmailSentAt, confirmationEmailFailedAt, confirmationEmailError
ALTER TABLE "orders" ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "confirmationEmailFailedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "confirmationEmailError" TEXT;
