-- Add shippingCedula snapshot to orders (like shippingName, shippingPhone)
ALTER TABLE "orders" ADD COLUMN "shippingCedula" TEXT;

-- Add cedula to registered users
ALTER TABLE "users" ADD COLUMN "cedula" TEXT;
