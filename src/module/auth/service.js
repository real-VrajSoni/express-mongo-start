import ApiError from '../../common/utils/ApiError.js';

// Add your authentication logic in these functions.
// They currently return 501 errors so the starter never pretends login works.

export async function register(data) {
  // TODO: validate input, hash the password, and save the user.
  notImplemented('Register');
}

export async function login(data) {
  // TODO: check the password and create a session.
  notImplemented('Login');
}

export async function forgotPassword(data) {
  // TODO: create an expiring reset token and send the reset link.
  notImplemented('Forgot password');
}

export async function logout(data) {
  // TODO: end the user's session.
  notImplemented('Logout');
}

export async function resetPassword(data) {
  // TODO: check the reset token and save the new password hash.
  notImplemented('Reset password');
}

function notImplemented(action) {
  throw new ApiError(501, `${action} is a starter placeholder. Add your code in service.js.`);
}
