#!/bin/bash
create_user() {
    local EMAIL=$1
    local PASSWORD=$2

    # Attempt to get the user
    aws cognito-idp admin-get-user --user-pool-id $COGNITO_USER_POOL_ID --username $EMAIL > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "User exists. Updating..."
        aws cognito-idp admin-update-user-attributes --user-pool-id $COGNITO_USER_POOL_ID --username $EMAIL --user-attributes Name=email,Value=$EMAIL Name=email_verified,Value=true
    else
        echo "User does not exist. Creating..."
        aws cognito-idp admin-create-user --user-pool-id $COGNITO_USER_POOL_ID --username $EMAIL --user-attributes Name=email,Value=$EMAIL Name=email_verified,Value=true --temporary-password $PASSWORD
        aws cognito-idp admin-set-user-password --user-pool-id $COGNITO_USER_POOL_ID --username $EMAIL --password $PASSWORD --permanent
    fi
}

echo 'Seeding Cognito...'
create_user 'test@gmail.com' 'abcd1234'