// Never hardcode the API origin — always read from env.
// Bare host only (e.g. http://localhost:3000), no path suffix: the backend
// serves every router on one flat base path, so each endpoint's `query`
// writes its own full path.
export const ApiDomain = import.meta.env.VITE_API_DOMAIN;
