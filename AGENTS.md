Top-level instructions for Agents that serves for all the parts of the app, specific AGENTS.md will be found in backend and frontend and should also be respected.

Nested rules (like `/backend/AGENTS.md`) can override top level instructions if specified.

## Always document new CODEBASE features
### Rule of thumb: If the user care about the feature, it's probably not worth documenting, unless a user manual is added in the codebase

Good examples: 
- Added gatling stress test for the backend, adds info on what it tests and how to run 
- Add full support for devcontainers, with instructions on how to use

Bad examples:
- Documents the implementation of Dark Mode on the Frontend 
- Documents a new field in a database table
