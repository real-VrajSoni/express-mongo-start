// Local development delivery: copy the token from your server terminal.
// The service disables this delivery method in production.
export default function sendResetToken(email, token) {
  console.log(`Reset token for ${email}: ${token}`);
}
