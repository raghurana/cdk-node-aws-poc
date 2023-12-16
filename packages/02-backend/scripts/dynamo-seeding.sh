echo 'Seeding DynamoDb with sample schemas...'
aws dynamodb put-item \
    --table-name $DYNAMO_TABLE_OPSTORE \
     --item '{
        "PK": {
            "S": "SCHEMA#S0001"
        },
        "SK": {
            "S": "VERSION#20231222"
        },
        "JsonSchema": {
            "S": "{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"type\":\"object\",\"properties\":{\"data\":{\"type\":\"object\",\"properties\":{\"dataSupplierCode\":{\"type\":\"string\"},\"intermediaryID\":{\"type\":\"string\"},\"intermediaryAuthorization\":{\"type\":\"string\"},\"transactionBrokerFees\":{\"type\":\"number\"},\"transactionWaterAuthFees\":{\"type\":\"string\"},\"intermediaryIDIndividual\":{\"type\":\"string\"}},\"required\":[\"dataSupplierCode\",\"intermediaryID\",\"intermediaryAuthorization\",\"transactionBrokerFees\",\"transactionWaterAuthFees\",\"intermediaryIDIndividual\"]},\"metaData\":{\"type\":\"object\",\"properties\":{\"categoryId\":{\"type\":\"string\"},\"categoryName\":{\"type\":\"string\"},\"categoryType\":{\"type\":\"string\"},\"dataType\":{\"type\":\"string\"},\"dataVersion\":{\"type\":\"string\"},\"schemaId\":{\"type\":\"string\"}},\"required\":[\"categoryId\",\"categoryName\",\"categoryType\",\"dataType\",\"dataVersion\",\"schemaId\"]}},\"required\":[\"data\",\"metaData\"]}"
        },
        "TransformationId": {
            "S": "buyselloffer-T0001"
        }
    }'
echo 'Seeding done'