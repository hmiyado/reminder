# 📅 定期タスクリマインダー

定期的な申請業務などのタスクを管理し、期限前に自動でGitHub Issueを作成してリマインドするシステムです。

## 🎯 特徴

- **自動リマインド**: 期限の30日前に自動でIssueを作成
- **自動日付更新**: Issueをcloseすると自動的に次回日程を計算・更新
- **シンプルな設定**: YAMLファイルでタスクを管理
- **軽量実装**: Deno + TypeScriptで外部依存なし

## 📁 ディレクトリ構成

```
reminder-tasks/
├── .github/
│   └── workflows/
│       ├── check-reminders.yml    # 毎日リマインドチェック
│       └── update-completed.yml   # Issue完了時の更新
├── scripts/
│   ├── check_tasks.ts             # リマインド確認スクリプト
│   └── update_task.ts             # 日付更新スクリプト
├── tasks.yml                      # タスク設定ファイル
└── README.md
```

## 🚀 セットアップ

### 1. リポジトリの作成

このテンプレートを使用して新しいリポジトリを作成します。

### 2. GitHub Actionsの権限設定

リポジトリの設定で、GitHub Actionsにissueの作成とファイル編集の権限を付与します。

1. リポジトリの **Settings** > **Actions** > **General** へ移動
2. **Workflow permissions** セクションで以下を選択：
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### 3. タスクの追加

`tasks.yml` にタスクを追加します：

```yaml
tasks:
  - name: "建設業許可更新申請"
    interval_months: 60
    last_completed: "2024-01-15"
    next_due: "2029-01-15"
    description: "建設業許可の更新申請手続き"
    
  - name: "労働保険年度更新"
    interval_months: 12
    last_completed: "2024-06-01"
    next_due: "2025-06-01"
    description: "労働保険の年度更新手続き"

settings:
  reminder_days_before: 30
  timezone: "Asia/Tokyo"
```

## 📝 使い方

### タスクの追加

新しいタスクを追加する場合、`tasks.yml` に以下の形式で追記します：

```yaml
- name: "タスク名"
  interval_months: 12            # 実行間隔（月数）
  last_completed: "2024-01-15"   # 前回完了日
  next_due: "2025-01-15"         # 次回期限
  description: "タスクの説明"
```

### 自動リマインド

- 毎日午前9時（日本時間）に自動チェック
- 期限の30日前になるとIssueが自動作成されます
- Issueには `reminder` と `task` ラベルが付きます

### タスクの完了

1. 作成されたIssueを確認
2. タスクを完了したらIssueを **Close** する
3. 自動的に以下が実行されます：
   - 完了日が `last_completed` に記録
   - 次回期限が自動計算され `next_due` に設定
   - `tasks.yml` が自動更新されコミット

## ⚙️ カスタマイズ

### リマインドタイミングの変更

`tasks.yml` の `settings` セクションで変更できます：

```yaml
settings:
  reminder_days_before: 30  # 30日前 → 任意の日数に変更可能
  timezone: "Asia/Tokyo"
```

### チェック頻度の変更

`.github/workflows/check-reminders.yml` の cron を編集します：

```yaml
on:
  schedule:
    - cron: '0 9 * * *'  # 毎日9時 → 任意の時間に変更可能
```

cron形式の例：
- `0 9 * * *` - 毎日9時
- `0 9 * * 1` - 毎週月曜日9時
- `0 9 1 * *` - 毎月1日9時

## 🔧 ローカルでのテスト

Denoをインストール後、以下のコマンドでテストできます：

```bash
# リマインドチェックのテスト
deno run --allow-read --allow-net --allow-env scripts/check_tasks.ts

# 日付更新のテスト（環境変数を設定）
ISSUE_TITLE="📅 労働保険年度更新 - 期限通知" \
COMPLETED_DATE="2024-06-15" \
deno run --allow-read --allow-write --allow-env scripts/update_task.ts
```

## 📄 ライセンス

MIT License

