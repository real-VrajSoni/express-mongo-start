import * as authService from './service.js';
import registerDto from './Dto/register.dto.js';
import loginDto from './Dto/login.dto.js';
import forgotPasswordDto from './Dto/forgot-password.dto.js';
import logoutDto from './Dto/logout.dto.js';
import resetPasswordDto from './Dto/reset-password.dto.js';
import userDto from '../../common/dto/user.dto.js';
import sendResponse from '../../common/utils/ApiResponse.js';

export async function register(req, res) {
  const result = await authService.register(registerDto(req.body));
  return sendResponse(res, 201, 'Account created', result);
}

export async function login(req, res) {
  const result = await authService.login(loginDto(req.body));
  return sendResponse(res, 200, 'Logged in', result);
}

export async function forgotPassword(req, res) {
  await authService.forgotPassword(forgotPasswordDto(req.body));
  return sendResponse(res, 200, 'If an account exists, a reset token has been sent.');
}

export async function logout(req, res) {
  await authService.logout(logoutDto(req.user, req.authToken));
  return sendResponse(res, 200, 'Logged out');
}

export async function resetPassword(req, res) {
  await authService.resetPassword(resetPasswordDto(req.body));
  return sendResponse(res, 200, 'Password reset. Please log in again.');
}

export function me(req, res) {
  return sendResponse(res, 200, 'Your account', { user: userDto(req.user) });
}
