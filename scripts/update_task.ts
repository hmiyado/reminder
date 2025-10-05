#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

import { parse, stringify } from "https://deno.land/std@0.200.0/yaml/mod.ts";
import { parseDate, formatDate } from "./date_utils.ts";
import { Config, Task } from "./reminder_logic.ts";

async function readConfig(): Promise<Config> {
  const content = await Deno.readTextFile("tasks.yml");
  return parse(content) as Config;
}

async function writeConfig(config: Config): Promise<void> {
  const yamlContent = stringify(config);
  await Deno.writeTextFile("tasks.yml", yamlContent);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function extractTaskNameFromIssueTitle(issueTitle: string): string {
  const match = issueTitle.match(/📅\s*(.+?)\s*-\s*期限通知/);
  return match ? match[1].trim() : "";
}

async function updateTask(): Promise<void> {
  const issueTitle = Deno.env.get("ISSUE_TITLE");
  const completedDate = Deno.env.get("COMPLETED_DATE");

  if (!issueTitle || !completedDate) {
    console.error("❌ ISSUE_TITLE and COMPLETED_DATE environment variables are required");
    Deno.exit(1);
  }

  console.log(`🔄 Processing issue: ${issueTitle}`);
  console.log(`📅 Completed date: ${completedDate}`);

  try {
    const config = await readConfig();
    const taskName = extractTaskNameFromIssueTitle(issueTitle);

    if (!taskName) {
      console.error("❌ Could not extract task name from issue title");
      Deno.exit(1);
    }

    console.log(`🔍 Looking for task: ${taskName}`);

    const taskIndex = config.tasks.findIndex(task => task.name === taskName);

    if (taskIndex === -1) {
      console.error(`❌ Task not found: ${taskName}`);
      console.log("Available tasks:");
      config.tasks.forEach(task => console.log(`  - ${task.name}`));
      Deno.exit(1);
    }

    const task = config.tasks[taskIndex];
    const completedDateObj = parseDate(completedDate);
    const nextDueDate = addMonths(completedDateObj, task.interval_months);

    console.log(`📋 Updating task: ${task.name}`);
    console.log(`   Previous last_completed: ${task.last_completed}`);
    console.log(`   Previous next_due: ${task.next_due}`);

    config.tasks[taskIndex].last_completed = completedDate;
    config.tasks[taskIndex].next_due = formatDate(nextDueDate);

    console.log(`   New last_completed: ${config.tasks[taskIndex].last_completed}`);
    console.log(`   New next_due: ${config.tasks[taskIndex].next_due}`);

    await writeConfig(config);

    console.log("✅ Task updated successfully");
    console.log("📝 tasks.yml has been updated");

  } catch (error) {
    console.error(`❌ Error updating task: ${error}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await updateTask();
}