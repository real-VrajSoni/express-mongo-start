import { jsonBody, emailField, passwordField } from '../../../common/dto/validation.js';

export default function loginDto(body) {
  const data = jsonBody(body);
  return {
    email: emailField(data.email),
    password: passwordField(data.password),
  };
}
