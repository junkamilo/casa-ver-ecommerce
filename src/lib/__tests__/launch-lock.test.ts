/** @jest-environment node */

import {
  DEFAULT_LAUNCH_AT_ISO,
  getLaunchAt,
  getLaunchCountdown,
  isLaunchLockActive,
  isLaunchLockEnabled,
  isLaunchLockExemptRoute,
} from "@/lib/launch-lock";

function setEnv(key: string, value: string | undefined) {
  (process.env as Record<string, string | undefined>)[key] = value;
}

const LAUNCH_AT = new Date(DEFAULT_LAUNCH_AT_ISO);

describe("launch-lock helpers", () => {
  const originalEnabled = process.env.NEXT_PUBLIC_LAUNCH_LOCK_ENABLED;
  const originalAt = process.env.NEXT_PUBLIC_LAUNCH_AT;

  afterEach(() => {
    setEnv("NEXT_PUBLIC_LAUNCH_LOCK_ENABLED", originalEnabled);
    setEnv("NEXT_PUBLIC_LAUNCH_AT", originalAt);
  });

  it("isLaunchLockEnabled es true por defecto", () => {
    setEnv("NEXT_PUBLIC_LAUNCH_LOCK_ENABLED", undefined);
    expect(isLaunchLockEnabled()).toBe(true);
  });

  it("isLaunchLockEnabled respeta NEXT_PUBLIC_LAUNCH_LOCK_ENABLED=false", () => {
    setEnv("NEXT_PUBLIC_LAUNCH_LOCK_ENABLED", "false");
    expect(isLaunchLockEnabled()).toBe(false);
    expect(isLaunchLockActive(new Date("2026-06-01T00:00:00-05:00"))).toBe(
      false,
    );
  });

  it("isLaunchLockActive es true antes del launch y false después", () => {
    setEnv("NEXT_PUBLIC_LAUNCH_LOCK_ENABLED", "true");
    setEnv("NEXT_PUBLIC_LAUNCH_AT", DEFAULT_LAUNCH_AT_ISO);

    expect(isLaunchLockActive(new Date("2026-06-12T23:59:59-05:00"))).toBe(
      true,
    );
    expect(isLaunchLockActive(new Date("2026-06-13T12:00:00-05:00"))).toBe(
      false,
    );
    expect(isLaunchLockActive(new Date("2026-06-14T00:00:00-05:00"))).toBe(
      false,
    );
  });

  it("getLaunchCountdown calcula días, horas, minutos y segundos", () => {
    const now = new Date("2026-06-12T08:55:55-05:00");
    const countdown = getLaunchCountdown(now, LAUNCH_AT);

    expect(countdown.days).toBe(1);
    expect(countdown.hours).toBe(3);
    expect(countdown.minutes).toBe(4);
    expect(countdown.seconds).toBe(5);
    expect(countdown.totalMs).toBeGreaterThan(0);
  });

  it("getLaunchCountdown devuelve ceros cuando ya pasó el launch", () => {
    const now = new Date("2026-06-13T12:00:01-05:00");
    const countdown = getLaunchCountdown(now, LAUNCH_AT);

    expect(countdown).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    });
  });

  it("getLaunchAt usa DEFAULT cuando el env es inválido", () => {
    setEnv("NEXT_PUBLIC_LAUNCH_AT", "fecha-invalida");
    expect(getLaunchAt().toISOString()).toBe(
      new Date(DEFAULT_LAUNCH_AT_ISO).toISOString(),
    );
  });

  it("isLaunchLockExemptRoute exime /admin y /login", () => {
    expect(isLaunchLockExemptRoute("/admin")).toBe(true);
    expect(isLaunchLockExemptRoute("/admin/productos")).toBe(true);
    expect(isLaunchLockExemptRoute("/login")).toBe(true);
    expect(isLaunchLockExemptRoute("/login?callbackUrl=/admin")).toBe(true);
    expect(isLaunchLockExemptRoute("/tienda")).toBe(false);
    expect(isLaunchLockExemptRoute("/")).toBe(false);
    expect(isLaunchLockExemptRoute(null)).toBe(false);
  });
});
