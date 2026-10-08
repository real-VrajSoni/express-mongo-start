# Contributing

Help make this starter easier for someone learning their first backend.

## What helps

- Clearer setup instructions, examples, and comments.
- Small bug fixes with a simple explanation.
- Improvements that keep the code readable for beginners.

Open an issue before a larger change so we can discuss it. Keep each pull request focused on one improvement.

## Check your change

1. Follow the setup steps in [README.md](README.md).
2. Run `npm run db` and `npm run dev` in separate terminals, then try the route you changed.
3. Run `npm test`. The tests start a separate temporary MongoDB database and leave your local project data alone. The first run downloads the MongoDB binary if it is not already cached.
4. For behavior changes, check both successful requests and invalid input. Update relevant tests and documentation.

Describe what changed and how you checked it in your pull request. Keep the existing small-file structure and response format. Prefer straightforward JavaScript over extra layers or dependencies.

Do not commit `.env`, credentials, real tokens, `node_modules`, or `.mongo-data`. The password-reset token printed in the development terminal is private too.
