import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";

// Test helper to create a temporary tasks.yml file
async function createTestConfig(content: string): Promise<string> {
  const tempFile = await Deno.makeTempFile({ suffix: ".yml" });
  await Deno.writeTextFile(tempFile, content);
  return tempFile;
}

// Mock functions from check_tasks.ts
function parseDate(dateString: string): Date {
  return new Date(dateString);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

Deno.test("parseDate - should parse ISO date string correctly", () => {
  const date = parseDate("2024-06-15");
  assertEquals(date.getFullYear(), 2024);
  assertEquals(date.getMonth(), 5); // 0-indexed
  assertEquals(date.getDate(), 15);
});

Deno.test("addDays - should add days correctly", () => {
  const date = new Date("2024-01-15");
  const result = addDays(date, 10);
  assertEquals(formatDate(result), "2024-01-25");
});

Deno.test("addDays - should handle negative days", () => {
  const date = new Date("2024-01-15");
  const result = addDays(date, -30);
  assertEquals(formatDate(result), "2023-12-16");
});

Deno.test("addDays - should handle month boundaries", () => {
  const date = new Date("2024-01-31");
  const result = addDays(date, 1);
  assertEquals(formatDate(result), "2024-02-01");
});

Deno.test("formatDate - should format date as YYYY-MM-DD", () => {
  const date = new Date("2024-06-15T12:00:00Z");
  const formatted = formatDate(date);
  assertEquals(formatted, "2024-06-15");
});

Deno.test("reminder calculation - should calculate reminder date correctly", () => {
  const dueDate = parseDate("2024-07-15");
  const reminderDaysBefore = 30;
  const reminderDate = addDays(dueDate, -reminderDaysBefore);
  assertEquals(formatDate(reminderDate), "2024-06-15");
});

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

  const tempFile = await createTestConfig(testYaml);

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
