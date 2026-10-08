export default function loginDto(body = {}) {
  return {
    email: body.email,
    password: body.password,
  };
}
