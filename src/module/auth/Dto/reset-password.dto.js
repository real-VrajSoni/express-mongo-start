export default function resetPasswordDto(body = {}) {
  return {
    token: body.token,
    password: body.password,
  };
}
