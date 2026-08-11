import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AccountingSalePayloadDTO } from "../contracts/accounting-sale.dto";

export type AccountingWebhookStatus =
  | "PENDING"
  | "SENT"
  | "SKIPPED"
  | "FAILED";

export interface UpsertAccountingSaleInput {
  orderId: string;
  orderNumber: string;
  paidAt: Date;
  payload: AccountingSalePayloadDTO;
  webhookStatus: AccountingWebhookStatus;
  webhookAttempts?: number;
  webhookSentAt?: Date | null;
  webhookError?: string | null;
}

export interface AccountingSaleExportRow {
  id: string;
  orderId: string;
  orderNumber: string;
  paidAt: Date;
  payload: AccountingSalePayloadDTO;
  webhookStatus: string;
}

export class PrismaAccountingSaleRepository {
  async upsertByOrderId(input: UpsertAccountingSaleInput): Promise<void> {
    const payload = input.payload as unknown as Prisma.InputJsonValue;
    await prisma.accountingSaleExport.upsert({
      where: { orderId: input.orderId },
      create: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        paidAt: input.paidAt,
        payload,
        webhookStatus: input.webhookStatus,
        webhookAttempts: input.webhookAttempts ?? 0,
        webhookSentAt: input.webhookSentAt ?? null,
        webhookError: input.webhookError ?? null,
      },
      update: {
        orderNumber: input.orderNumber,
        paidAt: input.paidAt,
        payload,
        webhookStatus: input.webhookStatus,
        webhookAttempts: input.webhookAttempts ?? 0,
        webhookSentAt: input.webhookSentAt ?? null,
        webhookError: input.webhookError ?? null,
      },
    });
  }

  async updateWebhookResult(
    orderId: string,
    data: {
      webhookStatus: AccountingWebhookStatus;
      webhookAttempts: number;
      webhookSentAt?: Date | null;
      webhookError?: string | null;
    },
  ): Promise<void> {
    await prisma.accountingSaleExport.update({
      where: { orderId },
      data: {
        webhookStatus: data.webhookStatus,
        webhookAttempts: data.webhookAttempts,
        webhookSentAt: data.webhookSentAt ?? null,
        webhookError: data.webhookError ?? null,
      },
    });
  }

  async findByPaidAtRange(params: {
    from?: Date;
    to?: Date;
    cursor?: string;
    limit: number;
  }): Promise<{ rows: AccountingSaleExportRow[]; nextCursor: string | null }> {
    const where: Prisma.AccountingSaleExportWhereInput = {};
    if (params.from || params.to) {
      where.paidAt = {};
      if (params.from) where.paidAt.gte = params.from;
      if (params.to) where.paidAt.lte = params.to;
    }

    const rows = await prisma.accountingSaleExport.findMany({
      where,
      orderBy: [{ paidAt: "asc" }, { id: "asc" }],
      take: params.limit + 1,
      ...(params.cursor
        ? { cursor: { id: params.cursor }, skip: 1 }
        : {}),
      select: {
        id: true,
        orderId: true,
        orderNumber: true,
        paidAt: true,
        payload: true,
        webhookStatus: true,
      },
    });

    let nextCursor: string | null = null;
    let page = rows;
    if (rows.length > params.limit) {
      const next = rows.pop()!;
      nextCursor = next.id;
      page = rows;
    }

    return {
      rows: page.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.orderNumber,
        paidAt: r.paidAt,
        payload: r.payload as unknown as AccountingSalePayloadDTO,
        webhookStatus: r.webhookStatus,
      })),
      nextCursor,
    };
  }

  async listOrderIdsMissingExport(
    statuses: string[],
    take: number,
  ): Promise<string[]> {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: statuses as never[] },
        accountingSaleExport: null,
      },
      select: { id: true },
      orderBy: { paidAt: "asc" },
      take,
    });
    return orders.map((o) => o.id);
  }
}
