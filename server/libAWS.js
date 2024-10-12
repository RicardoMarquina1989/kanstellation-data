const {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
const { SESClient, SendEmailCommand, VerifyEmailIdentityCommand, GetIdentityVerificationAttributesCommand } = require("@aws-sdk/client-ses")

const CryptoJS = require('crypto-js');
const keys = require("./keys");

const credential = {
region: "us-east-1",
credentials: {
  accessKeyId: keys.awsAccessKeyId,
  secretAccessKey: keys.awsSecretAccessKey,
},
};


// AES encryption function
const encrypt=(text, key)=> {
  return CryptoJS.AES.encrypt(text, key).toString();
}

// AES decryption function
const decrypt=(encryptedText, key)=> {
  const bytes  = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

const retrieveSecrets = async (secret_name) => {
const client = new SecretsManagerClient(credential);
let response;
try {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
  
  const secret=JSON.parse(response.SecretString);
  return secret;
} catch (error) {
  console.error("AWS Secrets Manager: ", error);
  throw Error("AWS Secrets Manager: ", error);
}
};

const getKeys = async () => {
 try{ 
  // Retrieve Snowflake encryption key
  const encryptKeyJSON = await retrieveSecrets("Snowflake_Pwd");
  const encryptionKey=encryptKeyJSON["EncryptionKey"];
  
  // Retrieve PostgreSQL key
  const pgdb_config= await retrieveSecrets("PGDB_CONFIG");

  // Retrieve AWS Resources
  const aws_resource= await retrieveSecrets("AWS_RESOURCE");

  // JSON Structured Key
  const keys={
      encryptKey: encryptionKey,
      dbParams: pgdb_config,
      aws_resource: aws_resource
  }

  return keys;
} catch (error) {
  console.error("AWS Secrets Manager: ", error);
  throw Error("AWS Secrets Manager: ", error);
}
}

const storeSecret = async (secretName, key, value) => {
const client = new SecretsManagerClient(credential);
try {
  let response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
      VersionStage: "AWSCURRENT",
    })
  );

  let secretString = response.SecretString;
  let secretObject = JSON.parse(secretString);

  // Inserting the key and value into the secret object
  secretObject[key] = value;

  // Saving the updated secret
  response = await client.send(
    new PutSecretValueCommand({
      SecretId: secretName,
      SecretString: JSON.stringify(secretObject),
    })
  );
  console.info("AWS Secrets Manager: ", "Key and value inserted successfully.");
} catch (error) {
  console.error(error);
  throw new Error("AWS Secrets Manager: ", error);
}
};

async function retrieveEncryptionKey() {
try {
  const secretName = "Snowflake_Pwd"; // Replace with your actual secret name
  const secret = await retrieveSecrets(secretName);
  return secret["EncryptionKey"];
} catch (error) {
  console.error("Error retrieving secret:", error);
}
}

// AWS SES Verification -----------------------------------------

async function verifyEmail(emailAddress) {
// Email Address Validation
if(!validateEmail(emailAddress)) {
  console.error("Invaild Email Format!");
  return false;
}

// Check Email Verification
const isEmailVerifiedFlag=await isEmailVerified(emailAddress);
if(isEmailVerifiedFlag){
  console.info(`Email "${emailAddress}" Already verified`)
  return true;
}

const client = new SESClient(credential);
try {
    const params = { EmailAddress: emailAddress};
    const response = await client.send(new VerifyEmailIdentityCommand(params));
    console.log(`Send verify Email SUCCESS!`);
    return true;
} catch (error) { console.error(`Send verify Email FAILURE! ${error}`); return false;}
}

function validateEmail(email) {
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(email);
}

async function isEmailVerified(email) {
const sesClient = new SESClient(credential);
try {
    const params = { Identities: [email]};
    const command = new GetIdentityVerificationAttributesCommand(params);
    const response = await sesClient.send(command);

    if (response.VerificationAttributes && response.VerificationAttributes[email] &&
        response.VerificationAttributes[email].VerificationStatus === 'Success') {
        return true;
    } else {
        return false;
    }
} catch (error) {
    console.error("Error occurred while verifying email:", error);
    throw error;
}
}

// Send Email

async function sendEmail(senderEmail, recipientEmail, subject, body) {
const sesClient = new SESClient(credential);
try {
    // Check if the sender's email address is verified
    const identityVerificationAttributesCommand = new GetIdentityVerificationAttributesCommand({
        Identities: [senderEmail]
    });
    const response = await sesClient.send(identityVerificationAttributesCommand);
    const verificationStatus = response.VerificationAttributes[senderEmail].VerificationStatus;

    if (verificationStatus !== 'Success') {
        console.log(`Error: ${senderEmail} is not verified.`);
        return;
    }

    // Try to send the email
    const sendEmailCommand = new SendEmailCommand({
        Destination: {
            ToAddresses: [recipientEmail]
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: body
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: senderEmail
    });
    const sendEmailResponse = await sesClient.send(sendEmailCommand);
    console.log('Email sent! Message ID:', sendEmailResponse.MessageId);
} catch (error) {
    console.error('Error:', error);
}
}

module.exports = {
  retrieveSecrets,
  storeSecret,
  retrieveEncryptionKey,
  encrypt, decrypt,
  getKeys,
  verifyEmail,
  sendEmail
}