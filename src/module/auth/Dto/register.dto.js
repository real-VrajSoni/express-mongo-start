import { jsonBody, requiredString, emailField, passwordField } from '../../../common/dto/validation.js';

export default function registerDto(body) {
  const data = jsonBody(body);
  return {
    name: requiredString(data.name, 'name'),
    email: emailField(data.email),
    password: passwordField(data.password),
  };
}
