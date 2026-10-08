import * as authService from './service.js';
import registerDto from './Dto/register.dto.js';
import loginDto from './Dto/login.dto.js';
import forgotPasswordDto from './Dto/forgot-password.dto.js';
import logoutDto from './Dto/logout.dto.js';
import resetPasswordDto from './Dto/reset-password.dto.js';
import sendResponse from '../../common/utils/ApiResponse.js';

// Controllers read the request and send the response.
export async function register(req, res) {
  const data = registerDto(req.body);
  const result = await authService.register(data);
  return sendResponse(res, 201, 'Account created', result);
}

export async function login(req, res) {
  const data = loginDto(req.body);
  const result = await authService.login(data);
  return sendResponse(res, 200, 'Logged in', result);
}

export async function forgotPassword(req, res) {
  const data = forgotPasswordDto(req.body);
  const result = await authService.forgotPassword(data);
  return sendResponse(res, 200, 'Password reset requested', result);
}

export async function logout(req, res) {
  const data = logoutDto();
  const result = await authService.logout(data);
  return sendResponse(res, 200, 'Logged out', result);
}

export async function resetPassword(req, res) {
  const data = resetPasswordDto(req.body);
  const result = await authService.resetPassword(data);
  return sendResponse(res, 200, 'Password reset', result);
}
