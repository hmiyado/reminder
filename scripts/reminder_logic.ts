import { parseDate, addDays, formatDate } from "./date_utils.ts";

export interface Task {
  name: string;
  interval_months: number;
  last_completed: string;
  next_due: string;
  description: string;
}

export interface Settings {
  reminder_days_before: number;
  timezone: string;
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

/**
 * Check if a task should trigger a reminder on the given date
 */
export function shouldRemindTask(
  task: Task,
  reminderDaysBefore: number,
  today: Date
): boolean {
  const todayString = formatDate(today);
  const dueDate = parseDate(task.next_due);
  const reminderDate = addDays(dueDate, -reminderDaysBefore);
  const reminderDateString = formatDate(reminderDate);

  return todayString === reminderDateString;
}

/**
 * Get all tasks that should trigger reminders on the given date
 */
export function getTasksToRemind(
  config: Config,
  today: Date
): TaskReminder[] {
  return config.tasks.map(task => {
    const dueDate = parseDate(task.next_due);
    const reminderDate = addDays(dueDate, -config.settings.reminder_days_before);
    const reminderDateString = formatDate(reminderDate);
    const shouldRemind = shouldRemindTask(task, config.settings.reminder_days_before, today);

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
