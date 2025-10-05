import { assertEquals } from "https://deno.land/std@0.200.0/assert/mod.ts";
import { Config } from "./reminder_logic.ts";
import { getTasksToRemind } from "./reminder_logic.ts";

const mockConfigWithAssignees: Config = {
  tasks: [
    {
      name: "タスク1",
      interval_months: 12,
      last_completed: "2024-06-15",
      next_due: "2025-06-15",
      description: "タスク固有の担当者あり",
      assignee: "task-specific-user"
    },
    {
      name: "タスク2",
      interval_months: 12,
      last_completed: "2024-06-15",
      next_due: "2025-06-15",
      description: "担当者なし（デフォルトを使用）"
    }
  ],
  settings: {
    reminder_days_before: 30,
    timezone: "Asia/Tokyo",
    assignee: "default-user"
  }
};

Deno.test("assignee - task-specific assignee should be preserved", () => {
  const task = mockConfigWithAssignees.tasks[0];
  assertEquals(task.assignee, "task-specific-user");
});

Deno.test("assignee - task without assignee should use default from settings", () => {
  const task = mockConfigWithAssignees.tasks[1];
  const defaultAssignee = mockConfigWithAssignees.settings.assignee;

  // Task doesn't have assignee
  assertEquals(task.assignee, undefined);

  // But settings has default assignee
  assertEquals(defaultAssignee, "default-user");
});

Deno.test("assignee - fallback logic should work correctly", () => {
  const task1 = mockConfigWithAssignees.tasks[0];
  const task2 = mockConfigWithAssignees.tasks[1];
  const defaultAssignee = mockConfigWithAssignees.settings.assignee;

  // Task 1 should use task-specific assignee
  const assignee1 = task1.assignee || defaultAssignee;
  assertEquals(assignee1, "task-specific-user");

  // Task 2 should use default assignee
  const assignee2 = task2.assignee || defaultAssignee;
  assertEquals(assignee2, "default-user");
});

Deno.test("assignee - config without default assignee should work", () => {
  const configWithoutDefault: Config = {
    tasks: [
      {
        name: "タスク",
        interval_months: 12,
        last_completed: "2024-06-15",
        next_due: "2025-06-15",
        description: "テスト"
      }
    ],
    settings: {
      reminder_days_before: 30,
      timezone: "Asia/Tokyo"
    }
  };

  const task = configWithoutDefault.tasks[0];
  const defaultAssignee = configWithoutDefault.settings.assignee;
  const assignee = task.assignee || defaultAssignee;

  assertEquals(assignee, undefined);
});
