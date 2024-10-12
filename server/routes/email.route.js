const express = require("express");
const keys = require("../keys");
const router = express.Router();
const libAWS = require('../libAWS')
const fs = require("fs");

/**
 * Send mail to recipient after any users register
 */
router.route("/sign-up").post(async (req, res) => {
    const { email } = req.body;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const signedUpAt = (new Date()).toLocaleDateString('en-US', options);

    let mailTemplate = fs.readFileSync(__dirname + "/../email-template/sign-up-notification.html", "utf8");
    mailTemplate = mailTemplate.replace("{{email}}", email);
    mailTemplate = mailTemplate.replace("{{signedUpAt}}", signedUpAt);
    
    libAWS.sendEmail(keys.senderEmail, keys.signUpRecipientEmail, `New user has signed up.`, mailTemplate);

    res.send('Email sent successfully!');
});

module.exports = router;
