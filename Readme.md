## Deploy App + Infra to AWS

**Prerequisites ::** Make sure aws cli is installed on the box and [AWS profile is configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) for an admin user that can create iam roles etc.

> Note: - The deployment scripts are written in bash/zsh and tested on a Mac OS. If you are on Windows, you can use [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) or [Cygwin](https://www.cygwin.com/) to run the scripts. Also make sure scripts under 02-backend package have execute permissions. _chmod +x packages/02-backend/scripts/\*.sh_

From the workspace root directory, run the following commands in order.

- `npm i`
- `npm run bootstrap -w packages/01-infra`
  - 👆🏼one time only after initial git repo clone
- `npm run deploy` - This will call deploy script in each package in the correct order automatically.

## Send a test request (from project root)

- `chmod +x ./packages/02-backend/scripts/testapi.sh`
- `./packages/02-backend/scripts/testapi.sh <api-gateway-url> <api-key>`

## Destroy App + Infra

- `npm run destroy`

## Run Rest API locally

- `npm run dev -w packages/02-backend`

## How to gen Appsync client and schema for the first time for frontend

`npx @aws-amplify/cli codegen add --apiId <api-id> --region <region>`