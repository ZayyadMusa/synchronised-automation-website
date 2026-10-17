import { demoRooms, type HomeSystem } from "./home-demo";

export const planSystems: Record<HomeSystem, { label: string; service: string }> = {
  lighting: { label: "Smart lighting", service: "smart-home" },
  shading: { label: "Automated shading", service: "smart-home" },
  sound: { label: "Sound systems", service: "audio" },
  access: { label: "Locks & visitor access", service: "security" },
  security: { label: "Intrusion alerts", service: "security" },
};

export const planOptions = demoRooms.flatMap(room => room.systems.map(system => ({
  key: `${room.id}:${system}`,
  room: room.id,
  roomName: room.name,
  system,
  ...planSystems[system],
})));

// Only profile-backed systems supported by each illustrated space can enter a brief.
export function parseProjectPlan(value: unknown): string[] {
  const requested = typeof value === "string" ? value.slice(0, 1000).split(",") : Array.isArray(value) ? value : [];
  return planOptions.filter(option => requested.includes(option.key)).map(option => option.key);
}

export function projectEnquiry(plan: string[]) {
  const selected = parseProjectPlan(plan);
  if (!selected.length) return undefined;
  const lines = demoRooms.flatMap(room => {
    const items = planOptions.filter(option => option.room === room.id && selected.includes(option.key));
    return items.length ? [`${room.name}: ${items.map(option => option.label.toLowerCase()).join(", ")}.`] : [];
  });
  const services = new Set(planOptions.filter(option => selected.includes(option.key)).map(option => option.service));
  return {
    service: services.size === 1 ? [...services][0] : "general",
    message: `Hello Synchronised,\n\nI explored your connected-home demonstration. I would like to discuss these systems for my property:\n\n${lines.join("\n")}\n\nPlease help me explore a suitable scope for the project.`,
  };
}
