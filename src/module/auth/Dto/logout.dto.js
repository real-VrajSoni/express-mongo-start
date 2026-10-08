// The auth middleware supplies the user and bearer token.
export default function logoutDto(user, token) {
  return { userId: user._id, token };
}
