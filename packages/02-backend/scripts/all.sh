export APPSYNC_API_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AppsyncApiId'].OutputValue" --output text)
export APPSYNC_LAMBDA_DS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AppsyncLambdaDatasource'].OutputValue" --output text)
export COGNITO_USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolId'].OutputValue" --output text)
export DYNAMO_TABLE_OPSTORE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='DynamodbMainTableName'].OutputValue" --output text)

./scripts/lambdas-deploy.sh
./scripts/dynamo-seeding.sh
./scripts/appsync-upsert-resolvers.sh
./scripts/cognito-seeding.sh