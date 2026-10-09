import { createAuthClient } from 'better-auth/react';

// Same-origin requests go through Next.js in development and Nginx in Docker.
export const authClient = createAuthClient({
  basePath: '/api/auth',
});
