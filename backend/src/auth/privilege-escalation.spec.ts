import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { ReferralService } from '../referral/referral.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AmbassadorGuard } from './guards/ambassador.guard';

// Régression : un utilisateur ne doit jamais pouvoir s'attribuer un rôle, un plan
// ou le statut ambassadeur via l'inscription ou la mise à jour de son profil.
describe('Privilege escalation (register + profile)', () => {
  let app: INestApplication;
  const authService = { register: jest.fn() };
  const usersService = { update: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, UsersController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: ReferralService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = { id: 'user-1', role: 'FREELANCER' };
          return true;
        },
      })
      .overrideGuard(AmbassadorGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    // Même configuration que main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    authService.register.mockResolvedValue({ user: {}, accessToken: 'a', refreshToken: 'r', streak: 0 });
    usersService.update.mockResolvedValue({ id: 'user-1' });
  });

  const base = { email: 'new@example.com', password: 'secret123', firstName: 'A', lastName: 'B', country: 'CA' };

  describe('POST /auth/register', () => {
    it.each(['ADMIN', 'EDITOR', 'SUPERUSER'])('rejette le rôle %s (400)', async (role) => {
      await request(app.getHttpServer()).post('/auth/register').send({ ...base, role }).expect(400);
      expect(authService.register).not.toHaveBeenCalled();
    });

    it.each(['FREELANCER', 'ENTREPRENEUR', 'COLLABORATOR'])('accepte le rôle %s', async (role) => {
      await request(app.getHttpServer()).post('/auth/register').send({ ...base, role }).expect(201);
      expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({ role }));
    });

    it('accepte une inscription sans rôle', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(base).expect(201);
    });
  });

  describe('PUT /users/profile', () => {
    it('ignore role, plan, isAmbassador, email et password', async () => {
      await request(app.getHttpServer())
        .put('/users/profile')
        .send({
          firstName: 'Marie',
          role: 'ADMIN',
          plan: 'BUSINESS',
          isAmbassador: true,
          email: 'evil@example.com',
          password: 'x',
        })
        .expect(200);

      expect(usersService.update).toHaveBeenCalledWith('user-1', { firstName: 'Marie' });
    });

    it('convertit birthDate en Date', async () => {
      await request(app.getHttpServer()).put('/users/profile').send({ birthDate: '1990-05-01' }).expect(200);
      expect(usersService.update).toHaveBeenCalledWith('user-1', { birthDate: new Date('1990-05-01') });
    });

    it('efface birthDate quand la chaîne est vide', async () => {
      await request(app.getHttpServer())
        .put('/users/profile')
        .send({ firstName: 'A', lastName: 'B', birthDate: '', country: '' })
        .expect(200);
      expect(usersService.update).toHaveBeenCalledWith('user-1', { firstName: 'A', lastName: 'B', birthDate: null, country: '' });
    });

    it('rejette une birthDate invalide (400)', async () => {
      await request(app.getHttpServer()).put('/users/profile').send({ birthDate: 'pas-une-date' }).expect(400);
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });
});
