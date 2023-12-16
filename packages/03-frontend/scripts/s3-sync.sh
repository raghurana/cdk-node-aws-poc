export S3_SPA_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='S3SpaBucketName'].OutputValue" --output text)

echo 'Syncing dist folder with s3...'
aws s3 sync dist s3://$S3_SPA_BUCKET --delete