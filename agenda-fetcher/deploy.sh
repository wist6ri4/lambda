echo "Building TypeScript..."
npx tsc

echo "Cleaning old build files..."
rm -rf lambda-package function.zip

echo "Copying build files..."
mkdir lambda-package
cp dist/index.js lambda-package/
cp -r node_modules lambda-package/

echo "Zipping the package..."
cd lambda-package
7z a -tzip ../function.zip .
cd ..

echo "Deploying to AWS Lambda..."
aws lambda update-function-code \
    --function-name AgendaFetcher \
    --zip-file fileb://function.zip \
    --region ap-northeast-1

echo "Deployment complete."


