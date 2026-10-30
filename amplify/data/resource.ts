import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

/**
 * One Progress record per user (id = Cognito user id) holding the whole app
 * state as JSON. The state is small (tens of KB), well under DynamoDB's
 * 400 KB item limit, and saving it as one document keeps writes to a single
 * debounced request.
 */
const schema = a.schema({
  Progress: a
    .model({
      // Declared explicitly: the record id is the user's Cognito id, set by the client.
      id: a.id().required(),
      state: a.json().required(),
      clientUpdatedAt: a.float().required(),
      // Owners can read their own record but never hand it to someone else.
      owner: a.string().authorization((allow) => [allow.owner().to(['read', 'delete'])]),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: 'userPool' },
});
