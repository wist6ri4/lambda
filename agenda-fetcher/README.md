# プロジェクト作成手順
## 1.初期化
```bash
mkdir agenda-fetcher
cd agenda-fetcher
npm init -y
```

## 2.依存関係のインストール
```bash
# 本体
npm install @notionhq/client dotenv

# 開発用
npm install --save-dev typescript ts-node @types/node @types/aws-lambda
```

## 3. TypeScriptの初期化
```bash
npx tsc --init
```

## 4. TypeScriptの設定ファイルを編集
`tsconfig.json`を以下のように編集します。
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "types": ["node"],
    },
    "include": ["src"],
}
```

# ディレクトリ構成
```plaintext
agenda-fetcher/
├── aws                 ← AWS関連の設定
├── dist/               ← コンパイル後の出力先
│   └── index.js        ← コンパイル後のLambda本体
├── lambda-package/     ← Lambda用のパッケージ
│   ├── node_modules/   ← 依存関係のモジュール
├── src/
│   └── index.ts        ← Lambda本体
├── .env                ← 環境変数（ローカル用）
├── .gitignore          ← Git管理から除外するファイル
├── deploy.sh           ← デプロイスクリプト
├── function.zip        ← デプロイ用のZIPファイル
├── package.json
├── package-lock.json
├── README.md           ← このドキュメント
├── tsconfig.json       ← TypeScriptの設定ファイル
```

# .envファイルの設定
```yaml
NOTION_TOKEN="your_notion_token_here" # Notion API token
NOTION_DATABASE_MINUTES_ID="your_notion_database_id_here" # Notion database ID for minutes
NOTION_DATABASE_AGENDA_ID="your_notion_database_agenda_id_here" # Notion database ID for agenda
```