#!/bin/sh
set -e

npx prisma migrate deploy
exec npx next start -p 3000
