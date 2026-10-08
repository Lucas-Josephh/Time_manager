import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { i18n, locales } from '@better-auth/i18n';

export function createAuth(
  prisma: PrismaService,
  config: ConfigService,
): ReturnType<
  typeof betterAuth<BetterAuthOptions & { plugins: [ReturnType<typeof i18n>] }>
> {
  const baseURL = config.getOrThrow<string>('BETTER_AUTH_URL');
  const frontend = config.getOrThrow<string>('FRONTEND_URL');
  const secret = config.getOrThrow<string>('BETTER_AUTH_SECRET');

  if (secret.length < 32)
    throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters');
  new URL(baseURL);
  if (new URL(frontend).origin !== frontend)
    throw new Error('FRONTEND_URL must be an origin');

  const options: BetterAuthOptions & {
    plugins: [ReturnType<typeof i18n>];
  } = {
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    secret,
    baseURL,
    basePath: '/api/auth',
    trustedOrigins: [frontend],
    socialProviders: {
      microsoft: {
        clientId: config.get<string>('MICROSOFT_CLIENT_ID')!,
        clientSecret: config.get<string>('MICROSOFT_CLIENT_SECRET')!,
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      disableSignUp: true,
    },
    user: {
      fields: { name: 'firstname' },
      additionalFields: {
        lastname: {
          type: 'string',
          required: true,
        },
        phone: {
          type: 'string',
          required: false,
        },
        teamId: {
          type: 'string',
          required: false,
          input: false,
        },
        isAdmin: {
          type: 'boolean',
          defaultValue: false,
          input: false,
        },
      },
    },
    session: {
      expiresIn: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: { enabled: false },
    },
    advanced: {
      disableOriginCheck: false,
      disableCSRFCheck: false,
      useSecureCookies: baseURL.startsWith('https:'),
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
    },
    rateLimit: { enabled: true },
    plugins: [
      i18n({
        defaultLocale: 'fr',
        translations: {
          fr: locales.fr,
        },
      }),
    ],
  };

  return betterAuth(options);
}
