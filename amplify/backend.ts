import { defineBackend } from '@aws-amplify/backend';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({ auth, data });

// Amplify creates on-demand tables by default, and on-demand requests are not in
// the always-free tier. Small provisioned capacity is (25 RCU/WCU per region), so
// the table stays at $0. Unused capacity accrues as burst credit, which absorbs
// the occasional larger save.
const progressTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['Progress'];
progressTable.billingMode = BillingMode.PROVISIONED;
progressTable.provisionedThroughput = { readCapacityUnits: 5, writeCapacityUnits: 5 };

// Personal app: nobody can sign themselves up. The one account is created from the
// Cognito console ("Create user"), which emails a temporary password.
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

// Invite-only: nobody can sign themselves up. Accounts for you and your friends are
// created from the Cognito console ("Create user"), which emails a temporary password.
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};
