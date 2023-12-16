aws lambda update-function-code --function-name $STACK_NAME-api-server --zip-file fileb://dist/index.zip
aws lambda update-function-code --function-name $STACK_NAME-s3-record-upload --zip-file fileb://dist/index.zip
aws lambda update-function-code --function-name $STACK_NAME-register-data --zip-file fileb://dist/index.zip
aws lambda update-function-code --function-name $STACK_NAME-run-antivirus --zip-file fileb://dist/index.zip
aws lambda update-function-code --function-name $STACK_NAME-validate-data --zip-file fileb://dist/index.zip
aws lambda update-function-code --function-name $STACK_NAME-standardize-data --zip-file fileb://dist/index.zip
aws lambda update-function-code --function-name $STACK_NAME-tag-rejected-data --zip-file fileb://dist/index.zip
aws lambda update-function-code --function-name $STACK_NAME-appsync-gql --zip-file fileb://dist/index.zip
sleep 2
aws lambda update-function-configuration --function-name $STACK_NAME-s3-record-upload --handler index.s3UploadHandler
aws lambda update-function-configuration --function-name $STACK_NAME-register-data --handler index.registerDataToQldbHandler
aws lambda update-function-configuration --function-name $STACK_NAME-run-antivirus --handler index.runAntivirusHandler
aws lambda update-function-configuration --function-name $STACK_NAME-validate-data --handler index.validateDataSchemaHandler
aws lambda update-function-configuration --function-name $STACK_NAME-standardize-data --handler index.standardizeAndStoreDataHandler
aws lambda update-function-configuration --function-name $STACK_NAME-tag-rejected-data --handler index.tagS3ObjectRejectedHandler
aws lambda update-function-configuration --function-name $STACK_NAME-appsync-gql --handler index.appSyncHandler