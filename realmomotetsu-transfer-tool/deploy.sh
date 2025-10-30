# 定数の設定
LAMBDA_FUNCTION_NAME="realmomotetsu-transfer-tool"
AWS_REGION="ap-northeast-1"

# ビルド
echo "Building TypeScript..."
npx tsc

# 古いビルドファイルの削除
echo "Cleaning old build files..."
rm -rf lambda_package function.zip

# Lambdaパッケージの準備
echo "Copying build files..."
mkdir lambda_package
cp dist/* lambda_package/
cp -r node_modules lambda_package/

# Zipファイルの作成
echo "Zipping the package..."
cd lambda_package
7z a -tzip ../function.zip .
cd ..

# .envから環境変数を読み込む
set -a
source ./.env
set +a

# Lambda関数が存在するかチェック
echo "Checking if Lambda function exists..."
if aws lambda get-function --function-name ${LAMBDA_FUNCTION_NAME} --region ${AWS_REGION} > /dev/null 2>&1; then
    echo "Lambda function ${LAMBDA_FUNCTION_NAME} exists. Updating..."
    # AWS CLIを使用してLambda関数の設定を更新
    echo "Updating AWS Lambda function configuration..."
    aws lambda update-function-configuration \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --environment "Variables={SUPABASE_URL_V1=\"$SUPABASE_URL_V1\",SUPABASE_URL_V2=\"$SUPABASE_URL_V2\",SUPABASE_ANON_KEY_V1=\"$SUPABASE_ANON_KEY_V1\",SUPABASE_ANON_KEY_V2=\"$SUPABASE_ANON_KEY_V2\"}"

    # Lambda関数のコードを更新
    echo "Deploying to AWS Lambda..."
    aws lambda update-function-code \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --zip-file fileb://function.zip \
        --region ${AWS_REGION}
else
    echo "Lambda function ${LAMBDA_FUNCTION_NAME} does not exist. Creating..."
    aws lambda create-function \
        --function-name ${LAMBDA_FUNCTION_NAME} \
        --runtime nodejs22.x \
        --role arn:aws:iam::${AWS_ACCOUNT_ID}:role/${AWS_EXECUTION_ROLE} \
        --handler index.handler \
        --zip-file fileb://function.zip \
        --region ${AWS_REGION}
fi

echo "Deployment completed."