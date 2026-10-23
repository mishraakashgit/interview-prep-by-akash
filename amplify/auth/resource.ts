import { defineAuth } from '@aws-amplify/backend';

/** Email + password sign-in backed by an Amazon Cognito user pool. */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Your Interview Prep verification code',
      verificationEmailBody: (createCode: () => string) => `Your verification code is ${createCode()}`,
    },
  },
});
