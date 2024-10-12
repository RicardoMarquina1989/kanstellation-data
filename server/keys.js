require("dotenv").config();
module.exports = {
  appPort: process.env.PORT || "5002",

  pgUser: process.env.PG_USER,
  pgHost: process.env.PG_HOST,
  pgDatabase: process.env.PG_DB,
  pgPassword: process.env.PG_PWD,
  pgPort: process.env.PG_PORT,

  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsLambdaArn: process.env.AWS_LAMBDA_Arn,
  awsLambdaRoleArn: process.env.AWS_LAMBDA_RoleArn,

  accountId: process.env.ACCOUNT_ID || 1,
  demoMode: process.env.DEMO_MODE || "disabled",
  signUpRecipientEmail: process.env.SIGN_UP_RECIPIENT_EMAIL || "signup@konstellationdata.com",
  senderEmail: process.env.SENDER_EMAIL || "support@konstellationdata.com"
};
