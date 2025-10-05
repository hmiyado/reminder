import { parseDate, addDays, formatDate } from "./date_utils.ts";

export interface Task {
  name: string;
  interval_months: number;
  last_completed: string;
  next_due: string;
  description: string;
  assignee?: string;
}

export interface Settings {
  reminder_days_before: number;
  timezone: string;
  assignee?: string;
}

export interface Config {
  tasks: Task[];
  settings: Settings;
}

export interface TaskReminder {
  task: Task;
  reminderDate: string;
  shouldRemind: boolean;
}

export interface ExistingIssue {
  title: string;
  state: "open" | "closed";
}

/**
 * Check if a task should trigger a reminder on the given date
 * Returns true if:
 * 1. Today is on or after the reminder date (todayString >= reminderDateString)
 * 2. There is no existing open issue for this task
 */
export function shouldRemindTask(
  task: Task,
  reminderDaysBefore: number,
  today: Date,
  existingIssues: ExistingIssue[] = []
): boolean {
  const todayString = formatDate(today);
  const dueDate = parseDate(task.next_due);
  const reminderDate = addDays(dueDate, -reminderDaysBefore);
  const reminderDateString = formatDate(reminderDate);

  // Check if today is on or after the reminder date
  if (todayString < reminderDateString) {
    return false;
  }

  // Check if there's already an open issue for this task
  const expectedIssueTitle = `📅 ${task.name} - 期限通知`;
  const hasOpenIssue = existingIssues.some(
    issue => issue.title === expectedIssueTitle && issue.state === "open"
  );

  return !hasOpenIssue;
}

/**
 * Get all tasks that should trigger reminders on the given date
 */
export function getTasksToRemind(
  config: Config,
  today: Date,
  existingIssues: ExistingIssue[] = []
): TaskReminder[] {
  return config.tasks.map(task => {
    const dueDate = parseDate(task.next_due);
    const reminderDate = addDays(dueDate, -config.settings.reminder_days_before);
    const reminderDateString = formatDate(reminderDate);
    const shouldRemind = shouldRemindTask(task, config.settings.reminder_days_before, today, existingIssues);

    return {
      task,
      reminderDate: reminderDateString,
      shouldRemind
    };
  });
}

/**
 * Filter tasks that need reminders
 */
export function filterTasksNeedingReminders(
  taskReminders: TaskReminder[]
): TaskReminder[] {
  return taskReminders.filter(tr => tr.shouldRemind);
}
