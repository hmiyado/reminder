# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese periodic task reminder system that automates GitHub Issue creation for recurring business tasks (like license renewals, annual filings, etc.). The system automatically creates reminders 30 days before due dates and updates task schedules when issues are closed.

## Architecture

- **Language**: TypeScript with Deno runtime
- **Dependencies**: No external dependencies - pure Deno/TypeScript implementation
- **Task Storage**: YAML configuration file (`tasks.yml`)
- **Automation**: GitHub Actions workflows trigger task checking and updates
- **Issue Management**: Automated GitHub Issue creation with `reminder` and `task` labels

## Expected Directory Structure

The project should follow this structure (as described in README):

```
reminder-tasks/
├── .github/
│   └── workflows/
│       ├── check-reminders.yml    # Daily reminder checks
│       └── update-completed.yml   # Issue completion handling
├── scripts/
│   ├── check_tasks.ts             # Reminder checking script
│   └── update_task.ts             # Task date update script
├── tasks.yml                      # Task configuration file
└── README.md
```

## Development Commands

Since this is a Deno project, use the following commands:

### Testing Scripts Locally
```bash
# Test reminder checking
deno run --allow-read --allow-net --allow-env scripts/check_tasks.ts

# Test task date updates (with environment variables)
ISSUE_TITLE="📅 労働保険年度更新 - 期限通知" \
COMPLETED_DATE="2024-06-15" \
deno run --allow-read --allow-write --allow-env scripts/update_task.ts
```

## Key Configuration

- **Task Configuration**: `tasks.yml` contains task definitions with intervals, due dates, and descriptions
- **Reminder Timing**: Default 30 days before due date (configurable in `tasks.yml`)
- **Timezone**: Asia/Tokyo (configurable in `tasks.yml`)
- **Automation Schedule**: Daily at 9 AM JST via GitHub Actions cron

## Task Management Workflow

1. Tasks are defined in `tasks.yml` with interval_months, last_completed, and next_due dates
2. Daily GitHub Action runs check_tasks.ts to find upcoming tasks
3. Issues are automatically created 30 days before due dates
4. When issues are closed, update_task.ts automatically updates next_due dates
5. The updated tasks.yml is committed back to the repository

## Important Notes

- This is a Japanese-language system (task names, descriptions, and issue content are in Japanese)
- The system is designed for business compliance tasks that occur on regular intervals
- All dates should be in YYYY-MM-DD format
- The system requires GitHub Actions permissions for issue creation and file modification