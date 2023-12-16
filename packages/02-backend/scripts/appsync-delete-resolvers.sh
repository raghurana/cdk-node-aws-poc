export APPSYNC_API_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='AppsyncApiId'].OutputValue" --output text)

# Comment out the commands below if you get this error  An error occurred (NotFoundException) when calling the DeleteResolver operation: No resolver found.
aws appsync delete-resolver --api-id $APPSYNC_API_ID --type-name 'Query' --field-name 'hello' 
aws appsync delete-resolver --api-id $APPSYNC_API_ID --type-name 'Mutation' --field-name 'saveTransformedData'