# ビルド
echo "Building TypeScript..."
npx tsc

# 古いビルドファイルを削除
echo "Cleaning old build files..."
rm -rf lambda-package function.zip

# Lambdaパッケージの準備
echo "Copying build files..."
mkdir lambda-package
cp dist/index.js lambda-package/
cp -r node_modules lambda-package/

echo "Zipping the package..."
cd lambda-package
7z a -tzip ../function.zip .
cd ..

# .env から環境変数を読み込む
set -a
source ./.env
set +a

# AWS CLIを使用してLambda関数の設定を更新
echo "Updating AWS Lambda function configuration..."
aws lambda update-function-configuration \
    --function-name AgendaFetcher \
    --environment "Variables={NOTION_TOKEN=\"$NOTION_TOKEN\",NOTION_DATABASE_MINUTES_ID=\"$NOTION_DATABASE_MINUTES_ID\",NOTION_DATABASE_AGENDA_ID=\"$NOTION_DATABASE_AGENDA_ID\"}"

# Lambda関数のコードを更新
echo "Deploying to AWS Lambda..."
aws lambda update-function-code \
    --function-name AgendaFetcher \
    --zip-file fileb://function.zip \
    --region ap-northeast-1

echo "Deployment complete."
