import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const domain = process.env.MAILGUN_DOMAIN || 'rhub.io';
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_KEY
});

async function mail_token(email, token) {
  const text = `Dear R package developer!

This is your verification code for your R-hub check submission:

${token}

If you haven't submitted anything to R-hub, please ignore this email.

Have questions, suggestions or want to report a bug?
Please start here: https://github.com/r-hub/help/discussions

Sincerely,
The R-hub team`;
  const mail = {
    from: '"R-hub builder" <support@rhub.io>',
    to: email,
	subject: 'R-hub check email validation',
	text: text
  }
  const res = await mg.messages.create(domain, mail);
}

export default mail_token;
