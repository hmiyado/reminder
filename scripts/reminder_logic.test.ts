import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import {
  shouldRemindTask,
  getTasksToRemind,
  filterTasksNeedingReminders,
  Task,
  Config
} from "./reminder_logic.ts";

const mockTask: Task = {
  name: "テストタスク",
  interval_months: 12,
  last_completed: "2024-06-15",
  next_due: "2025-06-15",
  description: "テスト用のタスクです"
};

const mockConfig: Config = {
  tasks: [
    mockTask,
    {
      name: "別のタスク",
      interval_months: 6,
      last_completed: "2024-01-15",
      next_due: "2024-07-15",
      description: "別のテストタスク"
    }
  ],
  settings: {
    reminder_days_before: 30,
    timezone: "Asia/Tokyo"
  }
};

Deno.test("shouldRemindTask - should return true on reminder date", () => {
  const today = new Date("2025-05-16"); // 30 days before 2025-06-15
  const result = shouldRemindTask(mockTask, 30, today);
  assertEquals(result, true);
});

Deno.test("shouldRemindTask - should return false before reminder date", () => {
  const today = new Date("2025-05-15"); // 31 days before 2025-06-15
  const result = shouldRemindTask(mockTask, 30, today);
  assertEquals(result, false);
});

Deno.test("shouldRemindTask - should return false after reminder date", () => {
  const today = new Date("2025-05-17"); // 29 days before 2025-06-15
  const result = shouldRemindTask(mockTask, 30, today);
  assertEquals(result, false);
});

Deno.test("shouldRemindTask - should handle different reminder days", () => {
  const today = new Date("2025-06-08"); // 7 days before 2025-06-15
  const result = shouldRemindTask(mockTask, 7, today);
  assertEquals(result, true);
});

Deno.test("getTasksToRemind - should return all tasks with reminder info", () => {
  const today = new Date("2025-05-16");
  const result = getTasksToRemind(mockConfig, today);

  assertEquals(result.length, 2);
  assertEquals(result[0].task.name, "テストタスク");
  assertEquals(result[0].reminderDate, "2025-05-16");
  assertEquals(result[0].shouldRemind, true);

  assertEquals(result[1].task.name, "別のタスク");
  assertEquals(result[1].reminderDate, "2024-06-15");
  assertEquals(result[1].shouldRemind, false);
});

Deno.test("filterTasksNeedingReminders - should filter only tasks needing reminders", () => {
  const today = new Date("2025-05-16");
  const taskReminders = getTasksToRemind(mockConfig, today);
  const result = filterTasksNeedingReminders(taskReminders);

  assertEquals(result.length, 1);
  assertEquals(result[0].task.name, "テストタスク");
  assertEquals(result[0].shouldRemind, true);
});

Deno.test("filterTasksNeedingReminders - should return empty array when no reminders needed", () => {
  const today = new Date("2025-01-01");
  const taskReminders = getTasksToRemind(mockConfig, today);
  const result = filterTasksNeedingReminders(taskReminders);

  assertEquals(result.length, 0);
});
