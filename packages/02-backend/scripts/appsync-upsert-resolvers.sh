#!/bin/bash
upsert_resolver() {
    local TYPE_NAME=$1
    local FIELD_NAME=$2

    # Attempt to get the resolver
    aws appsync get-resolver --api-id $APPSYNC_API_ID --type-name $TYPE_NAME --field-name $FIELD_NAME > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "Resolver exists. Updating..."
        aws appsync update-resolver --api-id $APPSYNC_API_ID --type-name $TYPE_NAME --field-name $FIELD_NAME --data-source-name $APPSYNC_LAMBDA_DS 
    else
        echo "Resolver does not exist. Creating..."
        aws appsync create-resolver --api-id $APPSYNC_API_ID --type-name $TYPE_NAME --field-name $FIELD_NAME --data-source-name $APPSYNC_LAMBDA_DS 
    fi
}

echo 'Upserting AppSync schema and resolvers...'
aws appsync start-schema-creation --api-id $APPSYNC_API_ID --definition "$(cat appsync-schema.gql | base64 -w 0)"
sleep 2
upsert_resolver "Query" "hello"
upsert_resolver "Mutation" "saveTransformedData"