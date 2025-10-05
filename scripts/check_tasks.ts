#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env

import { formatDate } from "./date_utils.ts";
import { Task, getTasksToRemind } from "./reminder_logic.ts";
import { fetchExistingIssues, getGitHubConfig, GitHubConfig } from "./github.ts";
import { readConfig } from "./config.ts";

async function createGitHubIssue(
  task: Task,
  reminderDate: string,
  githubConfig: GitHubConfig,
  defaultAssignee?: string
): Promise<void> {

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

  const issueData: any = {
    title: issueTitle,
    body: issueBody,
    labels: ["reminder", "task"]
  };

  // Use task-specific assignee if available, otherwise use default assignee
  const assignee = task.assignee || defaultAssignee;
  if (assignee) {
    issueData.assignees = [assignee];
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${githubConfig.repo}/issues`, {
      method: "POST",
      headers: {
        "Authorization": `token ${githubConfig.token}`,
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

    // Fetch existing issues from GitHub
    const githubConfig = getGitHubConfig();
    const existingIssues = githubConfig ? await fetchExistingIssues(githubConfig) : [];

    if (githubConfig) {
      console.log(`📂 Found ${existingIssues.length} existing issues`);
    } else {
      console.log("⚠️  GitHub token or repository not found - skipping issue creation");
    }

    const taskReminders = getTasksToRemind(config, today, existingIssues);

    for (const tr of taskReminders) {
      console.log(`📋 Task: ${tr.task.name}`);
      console.log(`   Due: ${tr.task.next_due}`);
      console.log(`   Reminder: ${tr.reminderDate}`);

      if (tr.shouldRemind) {
        if (githubConfig) {
          console.log(`🚨 Creating reminder for: ${tr.task.name}`);
          await createGitHubIssue(tr.task, tr.reminderDate, githubConfig, config.settings.assignee);
        } else {
          console.log(`⏭️  Would create reminder for: ${tr.task.name} (GitHub not configured)`);
        }
      } else {
        console.log(`⏱️  Not yet time for reminder or issue already exists`);
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