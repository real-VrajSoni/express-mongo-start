import { jsonBody, emailField } from '../../../common/dto/validation.js';

export default function forgotPasswordDto(body) {
  const data = jsonBody(body);
  return { email: emailField(data.email) };
}
