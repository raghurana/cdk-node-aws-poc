export APPSYNC_API_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AppsyncApiId'].OutputValue" --output text)
export APPSYNC_API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AppsyncApiUrl'].OutputValue" --output text)
export COGNITO_USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolId'].OutputValue" --output text)
export COGNITO_USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='CognitoUserPoolClientId'].OutputValue" --output text)

echo 'updating .env file...'
# Remove the existing .env file if it exists
rm -f .env

# Create a new .env file and add the entries
echo "VITE_APPSYNC_URL=$APPSYNC_API_URL" > .env
echo "VITE_COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID" >> .env
echo "VITE_COGNITO_USER_POOL_CLIENTID=$COGNITO_USER_POOL_CLIENT_ID" >> .env

echo 'updating .grahqlconfig.yml file...'
sed -i '' 's|apiId:.*|apiId: '$APPSYNC_API_ID'|' .graphqlconfig.yml