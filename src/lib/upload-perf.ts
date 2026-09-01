export type UploadPerfReport = {
  id: string;
  totalMs: number;
  phases: Array<{ phase: string; durationMs: number }>;
};

const activePhases = new Map<string, string>();

function markName(id: string, phase: string): string {
  return `upload:${id}:${phase}`;
}

export function markUploadStart(id: string, meta?: Record<string, string>): void {
  void meta;
  if (typeof performance === "undefined") return;
  performance.mark(markName(id, "start"));
  activePhases.set(id, "start");
}

export function markUploadPhase(id: string, phase: string): void {
  if (typeof performance === "undefined") return;

  const prev = activePhases.get(id);
  if (prev) {
    try {
      performance.measure(
        markName(id, `measure-${prev}-to-${phase}`),
        markName(id, prev),
        markName(id, phase),
      );
    } catch {
      // ignore missing marks
    }
  }

  performance.mark(markName(id, phase));
  activePhases.set(id, phase);
}

export function measureUpload(id: string): UploadPerfReport | null {
  if (typeof performance === "undefined") return null;

  markUploadPhase(id, "end");

  const prefix = `upload:${id}:`;
  const measures = performance
    .getEntriesByType("measure")
    .filter((entry) => entry.name.startsWith(prefix));

  const phases = measures.map((entry) => ({
    phase: entry.name.replace(prefix, "measure-").replace(/-to-/g, " → "),
    durationMs: Math.round(entry.duration),
  }));

  const start = performance.getEntriesByName(markName(id, "start"), "mark")[0];
  const end = performance.getEntriesByName(markName(id, "end"), "mark")[0];
  const totalMs =
    start && end ? Math.round(end.startTime - start.startTime) : 0;

  const report: UploadPerfReport = { id, totalMs, phases };

  if (process.env.NODE_ENV === "development") {
    console.table([{ uploadId: id, totalMs, ...Object.fromEntries(phases.map((p) => [p.phase, p.durationMs])) }]);
  }

  activePhases.delete(id);
  return report;
}

/** Server-side timing helper (Node). */
export function createServerUploadTimer() {
  const start = Date.now();
  const phases: Array<{ phase: string; atMs: number }> = [{ phase: "start", atMs: 0 }];

  return {
    mark(phase: string) {
      phases.push({ phase, atMs: Date.now() - start });
    },
    report(): UploadPerfReport {
      const totalMs = Date.now() - start;
      const durations: UploadPerfReport["phases"] = [];
      for (let i = 1; i < phases.length; i += 1) {
        durations.push({
          phase: `${phases[i - 1]!.phase} → ${phases[i]!.phase}`,
          durationMs: phases[i]!.atMs - phases[i - 1]!.atMs,
        });
      }
      return { id: "server", totalMs, phases: durations };
    },
  };
}
