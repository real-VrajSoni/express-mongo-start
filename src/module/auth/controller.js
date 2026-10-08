import * as authService from './service.js';
import registerDto from './Dto/register.dto.js';
import loginDto from './Dto/login.dto.js';
import forgotPasswordDto from './Dto/forgot-password.dto.js';
import logoutDto from './Dto/logout.dto.js';
import resetPasswordDto from './Dto/reset-password.dto.js';

// Controllers read the request and send the response.
export async function register(req, res) {
  const data = registerDto(req.body);
  const result = await authService.register(data);
  res.status(201).json(result);
}

export async function login(req, res) {
  const data = loginDto(req.body);
  const result = await authService.login(data);
  res.json(result);
}

export async function forgotPassword(req, res) {
  const data = forgotPasswordDto(req.body);
  const result = await authService.forgotPassword(data);
  res.json(result);
}

export async function logout(req, res) {
  const data = logoutDto();
  const result = await authService.logout(data);
  res.json(result);
}

export async function resetPassword(req, res) {
  const data = resetPasswordDto(req.body);
  const result = await authService.resetPassword(data);
  res.json(result);
}
