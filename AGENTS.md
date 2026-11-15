Top-level instructions for Agents that serves for all the parts of the app, specific AGENTS.md will be found in backend and frontend and should also be respected.

Nested rules (like `/backend/AGENTS.md`) can override top level instructions if specified.

## Docs 
### /docs/THINKER.md
In case the user asks for options on implementation instead of giving clear instructions, relevant planning and goes here; Example of what user can ask that goes into planning: 

- `"Which auth model should we implement for the backend?"`
- `"Database indexes first or straight to redis at this scale? both?"`

The options should be documented in the file, with pros and cons. if valid options > 1, document in order of impact per effort implementation, considering things like: Infra update, libraries needed, end user usability impact, and server usage toll. (More impactful should tipically come first)

### /docs/architecture.md
In case any pattern in `/docs/THINKER.md` is implemented in the codebase, promote it to `/<domain>/docs/ARCHITECTURE.md`, domain can be root, frontend, or backend, for now.
Deployment instructions, on the other hand, should probably stay on the respective `README.md` of each domain, unless there's a good, alongside with project overview, "What it does", etc.

> Rule of thumb: If the user care about the feature, it's probably not worth documenting, unless a user manual is added in the codebase

Good examples: 
- Documents the backend auth model, and why not implement other types of auth;
- Documents indexes implementation on the database, also explains why not implementing cache with Redis;

Bad examples:
- Documents the implementation of Dark Mode on the Frontend 
- Documents a new field in a database table

