import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { betterAuth } from 'better-auth';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { hashPassword } from 'better-auth/crypto';
import { createAuthClient } from 'better-auth/client';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/auth/auth.service';
import { configureApp } from '../../src/configure-app';
import { createAuth } from '../../src/lib/auth';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Native Better Auth', () => {
  let app: INestApplication;
  let auth: ReturnType<typeof createAuth>;
  let cookies: string[];
  const origin = 'http://localhost:3000';

  beforeAll(async () => {
    process.env.BETTER_AUTH_SECRET = 'test-secret-with-at-least-32-characters';
    process.env.BETTER_AUTH_URL = 'http://localhost:3001';
    process.env.FRONTEND_URL = origin;
    const options = createAuth(
      {} as PrismaService,
      new ConfigService(process.env),
    ).options;
    options.logger = { disabled: true };
    options.database = memoryAdapter({
      user: [],
      session: [],
      account: [],
      verification: [],
    });
    auth = betterAuth(options);
    const ctx = await auth.$context;
    const user = await ctx.internalAdapter.createUser(
      {
        name: 'Admin',
        lastname: 'Time Manager',
        isAdmin: true,
        email: 'admin@example.com',
        emailVerified: true,
      },
      { method: 'email-password' },
    );
    await ctx.internalAdapter.createAccount({
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: await hashPassword('seed-password-123'),
    });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(AuthService)
      .useValue({ auth })
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
  });

  it('exposes native routes, with signup disabled and origin checks', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/ok')
      .expect(200)
      .expect({ ok: true });
    await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .expect(200)
      .expect('null');
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({})
      .expect(404);
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', 'https://evil.example')
      .send({ email: 'admin@example.com', password: 'seed-password-123' })
      .expect(403);
    const signup = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('Origin', origin)
      .send({
        name: 'New',
        lastname: 'User',
        email: 'new@example.com',
        password: 'password-123',
      });
    expect(signup.status).toBe(400);
  });

  it('validates credentials and creates the native cookie session', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', origin)
      .send({ email: 'invalid' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', origin)
      .send({ email: 'admin@example.com', password: 'wrong' })
      .expect(401);
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', origin)
      .set('X-Forwarded-For', '192.0.2.10')
      .send({ email: 'admin@example.com', password: 'seed-password-123' })
      .expect(200);
    expect(response.body.user).toMatchObject({
      name: 'Admin',
      lastname: 'Time Manager',
      isAdmin: true,
    });
    expect(response.body.user.password).toBeUndefined();
    const setCookies = response.headers['set-cookie'] as unknown as string[];
    expect(
      setCookies.some((c) => /HttpOnly/i.test(c) && /SameSite=Lax/i.test(c)),
    ).toBe(true);
    cookies = setCookies.map((c) => c.split(';')[0]);
    const session = await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .set('Cookie', cookies)
      .expect(200);
    expect(session.body.user.email).toBe('admin@example.com');
  });

  it('does not expose the removed JWT plugin endpoints', async () => {
    await request(app.getHttpServer()).get('/api/auth/token').expect(404);
    await request(app.getHttpServer()).get('/api/auth/jwks').expect(404);
  });

  it('retains native rate limiting', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .set('Origin', origin)
        .set('X-Forwarded-For', '192.0.2.20')
        .send({ email: 'admin@example.com', password: 'wrong' })
        .expect(401);
    }
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', origin)
      .set('X-Forwarded-For', '192.0.2.20')
      .send({ email: 'admin@example.com', password: 'wrong' })
      .expect(429);
  });

  it('revokes the session and clears cookies on sign-out', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-out')
      .set('Origin', origin)
      .set('Cookie', cookies)
      .send({})
      .expect(200);
    expect(response.body.success).toBe(true);
    expect(
      (response.headers['set-cookie'] as unknown as string[]).some((c) =>
        /Max-Age=0/i.test(c),
      ),
    ).toBe(true);
    await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .set('Cookie', cookies)
      .expect(200)
      .expect('null');
  });

  it('supports the standard client signIn, getSession and signOut calls', async () => {
    let cookie = '';
    const client = createAuthClient({
      baseURL: 'http://localhost:3001',
      fetchOptions: {
        customFetchImpl: async (input, init) => {
          const headers = new Headers(init?.headers);
          headers.set('origin', origin);
          headers.set('x-forwarded-for', '192.0.2.30');
          if (cookie) headers.set('cookie', cookie);
          const response = await auth.handler(
            new Request(input, { ...init, headers }),
          );
          const updates = response.headers.getSetCookie();
          if (updates.length)
            cookie = updates.map((c) => c.split(';')[0]).join('; ');
          return response;
        },
      },
    });
    const login = await client.signIn.email({
      email: 'admin@example.com',
      password: 'seed-password-123',
    });
    expect(login.error).toBeNull();
    expect((await client.getSession()).data?.user.email).toBe(
      'admin@example.com',
    );
    expect((await client.signOut()).error).toBeNull();
    expect((await client.getSession()).data).toBeNull();
  });

  it('rejects an expired session even when its cookie is still present', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', origin)
      .set('X-Forwarded-For', '192.0.2.40')
      .send({ email: 'admin@example.com', password: 'seed-password-123' })
      .expect(200);
    const expiredCookies = (
      login.headers['set-cookie'] as unknown as string[]
    ).map((c) => c.split(';')[0]);
    const ctx = await auth.$context;
    await ctx.internalAdapter.updateSession(login.body.token as string, {
      expiresAt: new Date(Date.now() - 1000),
    });
    await request(app.getHttpServer())
      .get('/api/auth/get-session')
      .set('Cookie', expiredCookies)
      .expect(200)
      .expect('null');
  });
});
