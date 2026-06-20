/** @jest-environment node */

const orderFindManyMock = jest.fn();
const userCountMock = jest.fn();
const couponCountMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: (...args: unknown[]) => orderFindManyMock(...args),
    },
    user: {
      count: (...args: unknown[]) => userCountMock(...args),
    },
    coupon: {
      count: (...args: unknown[]) => couponCountMock(...args),
    },
  },
}));

import {
  getDiscountImpactByPeriod,
  getStatsByPeriod,
} from "@/modules/adminCatalog/stats/application/stats.use-cases";

describe("stats use-cases smoke", () => {
  beforeEach(() => {
    orderFindManyMock.mockReset();
    userCountMock.mockReset();
    couponCountMock.mockReset();
  });

  it("getStatsByPeriod filtra por estados de venta confirmada (no solo delivered)", async () => {
    orderFindManyMock
      .mockResolvedValueOnce([{ total: 120000 }])
      .mockResolvedValueOnce([{ total: 90000 }]);
    userCountMock.mockResolvedValueOnce(2);

    await getStatsByPeriod("week");

    expect(orderFindManyMock).toHaveBeenCalledTimes(2);
    const firstWhere = orderFindManyMock.mock.calls[0][0].where;
    const secondWhere = orderFindManyMock.mock.calls[1][0].where;

    expect(firstWhere.status).toEqual({
      in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
    });
    expect(secondWhere.status).toEqual({
      in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
    });
  });

  it("getDiscountImpactByPeriod excluye pending/cancelled del impacto", async () => {
    orderFindManyMock.mockResolvedValueOnce([{ discount: 10000, total: 110000 }]);
    couponCountMock.mockResolvedValueOnce(3);

    await getDiscountImpactByPeriod("week");

    const where = orderFindManyMock.mock.calls[0][0].where;
    expect(where.status).toEqual({
      in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
    });
    expect(where.discount).toEqual({ gt: 0 });
  });
});
