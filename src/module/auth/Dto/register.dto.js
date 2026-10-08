// Pick the fields that the register action needs.
export default function registerDto(body = {}) {
  return {
    name: body.name,
    email: body.email,
    password: body.password,
  };
}
