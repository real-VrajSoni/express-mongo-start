// Only these user fields are allowed in API responses.
export default function userDto(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
