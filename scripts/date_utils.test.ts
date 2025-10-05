import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import { parseDate, addDays, formatDate } from "./date_utils.ts";

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
