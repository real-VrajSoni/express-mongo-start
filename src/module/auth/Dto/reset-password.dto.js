import { jsonBody, tokenField, passwordField } from '../../../common/dto/validation.js';

export default function resetPasswordDto(body) {
  const data = jsonBody(body);
  return {
    token: tokenField(data.token),
    password: passwordField(data.password),
  };
}
