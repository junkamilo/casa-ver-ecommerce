/** @jest-environment node */
import { posWebhookPayloadSchema } from "../contracts/pos-catalog.schema";
import { planAdminSync, type LocalAdminCandidate } from "../domain/pos-admin-reconcile";

const admin = (userId: string, email: string, fullName = "Admin") => ({ userId, email, fullName, updatedAt: null });
const local = (overrides: Partial<LocalAdminCandidate>): LocalAdminCandidate => ({
  id: "w1",
  email: "ana@casaverde.co",
  name: "Ana",
  role: "USER",
  posUserId: null,
  ...overrides,
});

describe("aviso admin.upserted", () => {
  it("es un tipo válido del webhook", () => {
    expect(
      posWebhookPayloadSchema.safeParse({
        eventId: "e1",
        event: "admin.upserted",
        entityType: "admin",
        id: "admin",
        action: "upserted",
      }).success,
    ).toBe(true);
  });
});

describe("planAdminSync", () => {
  it("promueve por email a un cliente existente y lo enlaza al usuario del POS", () => {
    const plan = planAdminSync([admin("p1", "ANA@casaverde.co", "Ana Admin")], [local({})]);
    expect(plan.updates).toEqual([{ id: "w1", data: { role: "ADMIN", posUserId: "p1", name: "Ana Admin" } }]);
    expect(plan.creates).toEqual([]);
    expect(plan.demotions).toEqual([]);
  });

  it("crea la cuenta del admin que no existe en la web", () => {
    const plan = planAdminSync([admin("p2", "nuevo@casaverde.co", "Nuevo")], []);
    expect(plan.creates).toEqual([{ email: "nuevo@casaverde.co", name: "Nuevo", role: "ADMIN", posUserId: "p2" }]);
  });

  it("degrada a los admins de la web que el POS no publica y no toca a los clientes", () => {
    const plan = planAdminSync(
      [admin("p1", "ana@casaverde.co", "Ana")],
      [
        local({ role: "ADMIN", posUserId: "p1" }),
        local({ id: "w2", email: "viejo@casaverde.co", role: "ADMIN" }),
        local({ id: "w3", email: "retirado@casaverde.co", role: "ADMIN", posUserId: "p9" }),
      ],
    );
    expect(plan.updates).toEqual([]);
    expect(plan.demotions).toEqual(["w2", "w3"]);
  });

  it("sigue el cambio de email del POS por posUserId salvo que otra cuenta ya lo use", () => {
    const moved = planAdminSync(
      [admin("p1", "ana.nueva@casaverde.co", "Ana")],
      [local({ role: "ADMIN", posUserId: "p1" })],
    );
    expect(moved.updates).toEqual([
      { id: "w1", data: { role: "ADMIN", posUserId: "p1", name: "Ana", email: "ana.nueva@casaverde.co" } },
    ]);

    const taken = planAdminSync(
      [admin("p1", "cliente@casaverde.co", "Ana")],
      [local({ role: "ADMIN", posUserId: "p1" }), local({ id: "w2", email: "cliente@casaverde.co" })],
    );
    expect(taken.updates).toEqual([]);
    expect(taken.conflicts).toHaveLength(1);
    expect(taken.demotions).toEqual([]);
  });

  it("no roba una cuenta enlazada a otro usuario del POS", () => {
    const plan = planAdminSync(
      [admin("p1", "ana@casaverde.co"), admin("p2", "ana@casaverde.co")],
      [local({ role: "ADMIN", posUserId: "p1", name: "Admin" })],
    );
    expect(plan.creates).toEqual([]);
    expect(plan.conflicts).toHaveLength(1);
  });
});
