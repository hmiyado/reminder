#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env

import { parse } from "https://deno.land/std@0.200.0/yaml/mod.ts";

interface Task {
  name: string;
  interval_months: number;
  last_completed: string;
  next_due: string;
  description: string;
}

interface Settings {
  reminder_days_before: number;
  timezone: string;
}

interface Config {
  tasks: Task[];
  settings: Settings;
}

async function readConfig(): Promise<Config> {
  const content = await Deno.readTextFile("tasks.yml");
  return parse(content) as Config;
}

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

async function createGitHubIssue(task: Task, reminderDate: string): Promise<void> {
  const token = Deno.env.get("GITHUB_TOKEN");
  const repo = Deno.env.get("GITHUB_REPOSITORY");

  if (!token || !repo) {
    console.log("GitHub token or repository not found - skipping issue creation");
    return;
  }

  const issueTitle = `📅 ${task.name} - 期限通知`;
  const issueBody = `## 📋 タスク詳細

**タスク名**: ${task.name}
**期限**: ${task.next_due}
**説明**: ${task.description}

## ⏰ スケジュール

- **前回完了日**: ${task.last_completed}
- **次回期限**: ${task.next_due}
- **間隔**: ${task.interval_months}ヶ月

## ✅ 完了時の手順

このタスクが完了したら、このIssueを **Close** してください。
自動的に次回の期限が計算され、タスク設定が更新されます。

---
*この通知は期限の30日前に自動作成されました*`;

  const issueData = {
    title: issueTitle,
    body: issueBody,
    labels: ["reminder", "task"]
  };

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(issueData)
    });

    if (response.ok) {
      const issue = await response.json();
      console.log(`✅ Issue created: ${issue.html_url}`);
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to create issue: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ Error creating issue: ${error}`);
  }
}

async function checkTasks(): Promise<void> {
  try {
    const config = await readConfig();
    const today = new Date();
    const todayString = formatDate(today);

    console.log(`🔍 Checking tasks for ${todayString}`);

    for (const task of config.tasks) {
      const dueDate = parseDate(task.next_due);
      const reminderDate = addDays(dueDate, -config.settings.reminder_days_before);
      const reminderDateString = formatDate(reminderDate);

      console.log(`📋 Task: ${task.name}`);
      console.log(`   Due: ${task.next_due}`);
      console.log(`   Reminder: ${reminderDateString}`);

      if (todayString === reminderDateString) {
        console.log(`🚨 Creating reminder for: ${task.name}`);
        await createGitHubIssue(task, reminderDateString);
      } else {
        console.log(`⏱️  Not yet time for reminder`);
      }
    }
  } catch (error) {
    console.error(`❌ Error checking tasks: ${error}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await checkTasks();
}