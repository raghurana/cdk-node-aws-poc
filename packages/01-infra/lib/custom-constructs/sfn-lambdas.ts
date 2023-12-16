import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PocStackProps } from "../interface";
import { LambdaBasic } from "./lambda-basic";

interface StepFnLambdasProps extends PocStackProps {
  registerToQldbLambda: LambdaBasic;
  runAntivirusLambda: LambdaBasic;
  validateDataSchemaLambda: LambdaBasic;
  standardizeAndStoreDataLambda: LambdaBasic;
  tagRejectedDataLambda: LambdaBasic;
}

export class StepFnLambdas extends Construct {
  readonly stateMachine: cdk.aws_stepfunctions.StateMachine;

  constructor(scope: Construct, id: string, props: StepFnLambdasProps) {
    super(scope, id);

    const registerToQldbJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "Register to QLDB Job", {
      lambdaFunction: props.registerToQldbLambda.function,
    });

    const runAntivirusJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "Run Antivirus Job", {
      lambdaFunction: props.runAntivirusLambda.function,
    });

    const validateDataSchemaJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "Validate Data Schema Job", {
      lambdaFunction: props.validateDataSchemaLambda.function,
    });

    const standardizeAndStoreDataJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "Standardise Save Data Job", {
      lambdaFunction: props.standardizeAndStoreDataLambda.function,
    });

    const tagRejectedDataJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(this, "Tag Rejected Data Job", {
      lambdaFunction: props.tagRejectedDataLambda.function,
    });

    // Create state machine
    this.stateMachine = new cdk.aws_stepfunctions.StateMachine(this, "DataIngestionStateMachine", {
      stateMachineType: cdk.aws_stepfunctions.StateMachineType.STANDARD,
      timeout: cdk.Duration.minutes(5),
      definitionBody: cdk.aws_stepfunctions.DefinitionBody.fromChainable(
        registerToQldbJob.next(
          new cdk.aws_stepfunctions.Choice(this, "Register to QLDB Ok?")
            .when(cdk.aws_stepfunctions.Condition.stringEquals("$.Payload.result", "Failed"), tagRejectedDataJob)
            .otherwise(
              runAntivirusJob.next(
                new cdk.aws_stepfunctions.Choice(this, "Antivirus Ok?")
                  .when(cdk.aws_stepfunctions.Condition.stringEquals("$.Payload.result", "Failed"), tagRejectedDataJob)
                  .otherwise(
                    validateDataSchemaJob.next(
                      new cdk.aws_stepfunctions.Choice(this, "Data Schema Ok?")
                        .when(
                          cdk.aws_stepfunctions.Condition.stringEquals("$.Payload.result", "Failed"),
                          tagRejectedDataJob
                        )
                        .otherwise(standardizeAndStoreDataJob)
                    )
                  )
              )
            )
        )
      ),
    });

    // Grant lambda execution roles
    props.registerToQldbLambda.function.grantInvoke(this.stateMachine.role);
    props.runAntivirusLambda.function.grantInvoke(this.stateMachine.role);
    props.validateDataSchemaLambda.function.grantInvoke(this.stateMachine.role);
    props.standardizeAndStoreDataLambda.function.grantInvoke(this.stateMachine.role);
    props.tagRejectedDataLambda.function.grantInvoke(this.stateMachine.role);
  }
}
