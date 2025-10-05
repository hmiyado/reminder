import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import { parseDate, addDays, formatDate } from "./date_utils.ts";

Deno.test("config parsing - should handle valid YAML", async () => {
  const testYaml = `
tasks:
  - name: "テストタスク"
    interval_months: 12
    last_completed: "2023-06-15"
    next_due: "2024-06-15"
    description: "テスト用のタスクです"

settings:
  reminder_days_before: 30
  timezone: "Asia/Tokyo"
`;

  const tempFile = await Deno.makeTempFile({ suffix: ".yml" });
  await Deno.writeTextFile(tempFile, testYaml);

  try {
    const { parse } = await import("https://deno.land/std@0.200.0/yaml/mod.ts");
    const content = await Deno.readTextFile(tempFile);
    const config = parse(content) as any;

    assertEquals(config.tasks.length, 1);
    assertEquals(config.tasks[0].name, "テストタスク");
    assertEquals(config.tasks[0].interval_months, 12);
    assertEquals(config.settings.reminder_days_before, 30);
    assertEquals(config.settings.timezone, "Asia/Tokyo");
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("reminder logic - should trigger on reminder date", () => {
  const today = new Date("2024-06-15");
  const todayString = formatDate(today);

  const dueDate = parseDate("2024-07-15");
  const reminderDate = addDays(dueDate, -30);
  const reminderDateString = formatDate(reminderDate);

  assertEquals(todayString === reminderDateString, true);
});

Deno.test("reminder logic - should not trigger before reminder date", () => {
  const today = new Date("2024-06-14");
  const todayString = formatDate(today);

  const dueDate = parseDate("2024-07-15");
  const reminderDate = addDays(dueDate, -30);
  const reminderDateString = formatDate(reminderDate);

  assertEquals(todayString === reminderDateString, false);
});

Deno.test("reminder logic - should not trigger after reminder date", () => {
  const today = new Date("2024-06-16");
  const todayString = formatDate(today);

  const dueDate = parseDate("2024-07-15");
  const reminderDate = addDays(dueDate, -30);
  const reminderDateString = formatDate(reminderDate);

  assertEquals(todayString === reminderDateString, false);
});
