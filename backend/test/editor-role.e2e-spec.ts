import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { AdminController } from '../src/admin/admin.controller';
import { AdminService } from '../src/admin/admin.service';
import { ContentController } from '../src/agent/content/content.controller';
import { ContentService } from '../src/agent/content/content.service';
import { SiteContentController } from '../src/site-content/site-content.controller';
import { SiteContentService } from '../src/site-content/site-content.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { ROLES_KEY } from '../src/auth/decorators/roles.decorator';
import { ABOUT } from './fixtures/about-content';

// Vérifie le périmètre du rôle EDITOR : 403 partout dans /admin, 200 sur les contenus
// et la présentation du site — et aucune régression pour ADMIN.
// Pas de base de données : services mockés, vrais contrôleurs, vrai RolesGuard.

type Route = [method: string, url: string, body: object | undefined, status: number];

// Les lignes sont complétées à 4 colonnes : it.each passerait sinon un callback « done » à la place
// des colonnes manquantes.
const route = (method: string, url: string, body?: object, status = 200): Route => [method, url, body, status];

const ROUTES_FORBIDDEN_FOR_EDITOR: Route[] = [
  route('get', '/admin/stats'),
  route('get', '/admin/users'),
  route('delete', '/admin/users/u-2'),
  route('put', '/admin/users/u-2/plan', { plan: 'PRO' }),
  route('get', '/admin/ambassadors'),
  route('put', '/admin/users/u-2/ambassador', { isAmbassador: true }),
  route('put', '/admin/users/u-2/role', { editor: true }),
];

const ROUTES_ALLOWED_FOR_EDITOR: Route[] = [
  route('post', '/agent/content/generate', { type: 'LINKEDIN_POST', topic: 'Lancement' }, 201),
  route('get', '/agent/content'),
  route('get', '/agent/content/c-1'),
  route('patch', '/agent/content/c-1', { title: 'Nouveau titre' }),
  route('get', '/site-content/about/editor'),
  route('put', '/site-content/about', { title: 'À propos', content: ABOUT }),
];

describe('Rôle EDITOR — contrôle d’accès', () => {
  let app: INestApplication;
  const adminService = {
    getStats: jest.fn().mockResolvedValue({}),
    getUsers: jest.fn().mockResolvedValue({ users: [] }),
    deleteUser: jest.fn().mockResolvedValue({}),
    updateUserPlan: jest.fn().mockResolvedValue({}),
    getAmbassadors: jest.fn().mockResolvedValue([]),
    setAmbassador: jest.fn().mockResolvedValue({}),
    setEditor: jest.fn().mockResolvedValue({}),
  };
  const contentService = {
    generate: jest.fn().mockResolvedValue({ id: 'c-1' }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'c-1' }),
    update: jest.fn().mockResolvedValue({ id: 'c-1' }),
  };
  const prisma = {
    siteContent: {
      findUnique: jest.fn().mockResolvedValue({ key: 'about', title: 'À propos', content: ABOUT }),
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminController, ContentController, SiteContentController],
      providers: [
        SiteContentService,
        { provide: AdminService, useValue: adminService },
        { provide: ContentService, useValue: contentService },
        { provide: PrismaService, useValue: prisma },
      ],
    })
      // Remplace la vérification JWT : le rôle de l'utilisateur vient de l'en-tête x-test-role
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          const role = req.headers['x-test-role'];
          if (!role) throw new UnauthorizedException();
          req.user = { id: 'u-1', role };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  const call = (method: string, url: string, role?: UserRole, body?: object) => {
    let req = (request(app.getHttpServer()) as any)[method](url);
    if (role) req = req.set('x-test-role', role);
    return body ? req.send(body) : req;
  };

  describe('EDITOR', () => {
    it.each(ROUTES_FORBIDDEN_FOR_EDITOR)('403 sur %s %s', async (method, url, body, _status) => {
      await call(method, url, UserRole.EDITOR, body).expect(403);
    });

    it.each(ROUTES_ALLOWED_FOR_EDITOR)('200 sur %s %s', async (method, url, body, status) => {
      await call(method, url, UserRole.EDITOR, body).expect(status);
    });

    it('aucun service admin n’a été appelé', () => {
      Object.values(adminService).forEach((fn) => expect(fn).not.toHaveBeenCalled());
    });
  });

  describe('ADMIN (pas de régression)', () => {
    it.each(ROUTES_FORBIDDEN_FOR_EDITOR)('200 sur %s %s', async (method, url, body, _status) => {
      await call(method, url, UserRole.ADMIN, body).expect(200);
    });

    it.each(ROUTES_ALLOWED_FOR_EDITOR)('200 sur %s %s', async (method, url, body, status) => {
      await call(method, url, UserRole.ADMIN, body).expect(status);
    });
  });

  describe('Membres', () => {
    it.each([UserRole.FREELANCER, UserRole.ENTREPRENEUR, UserRole.COLLABORATOR])(
      '%s : 403 sur /admin, /agent/content et PUT /site-content',
      async (role) => {
        await call('get', '/admin/users', role).expect(403);
        await call('get', '/agent/content', role).expect(403);
        await call('put', '/site-content/about', role, { title: 'x', content: ABOUT }).expect(403);
      },
    );

    it('GET /site-content/about est public', async () => {
      await call('get', '/site-content/about').expect(200);
    });

    it('PUT /site-content/about sans session : 401', async () => {
      await call('put', '/site-content/about', undefined, { title: 'x', content: ABOUT }).expect(401);
    });
  });

  describe('Validation du contenu', () => {
    it('400 si le contenu est incomplet', async () => {
      await call('put', '/site-content/about', UserRole.EDITOR, { title: 'x', content: { intro: 'seul' } }).expect(400);
    });

    it('400 sur un champ inconnu', async () => {
      await call('put', '/site-content/about', UserRole.EDITOR, {
        title: 'x',
        content: { ...ABOUT, script: '<script>' },
      }).expect(400);
    });

    it('404 sur une clé non éditable', async () => {
      await call('put', '/site-content/pricing', UserRole.ADMIN, { title: 'x', content: ABOUT }).expect(404);
    });

    it('enregistre l’auteur de la modification', async () => {
      prisma.siteContent.upsert.mockClear();
      await call('put', '/site-content/about', UserRole.EDITOR, { title: 'À propos', content: ABOUT }).expect(200);
      expect(prisma.siteContent.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ updatedById: 'u-1', content: ABOUT }) }),
      );
    });
  });
});

// Filet de sécurité : si quelqu'un ajoute EDITOR sur une nouvelle route, ce test échoue
// tant que la liste ci-dessous n'est pas mise à jour consciemment.
describe('Routes ouvertes à EDITOR (inventaire)', () => {
  const EXPECTED = [
    'ContentController.findAll',
    'ContentController.findOne',
    'ContentController.generate',
    'ContentController.update',
    'SiteContentController.findOneForEditor',
    'SiteContentController.update',
  ];

  const controllerFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) return controllerFiles(p);
      return f.endsWith('.controller.ts') ? [p] : [];
    });

  it('correspond exactement à la liste attendue', () => {
    const reflector = new Reflector();
    const found: string[] = [];
    for (const file of controllerFiles(join(__dirname, '../src'))) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(file);
      for (const ctrl of Object.values(mod) as any[]) {
        if (typeof ctrl !== 'function' || !Reflect.hasMetadata('path', ctrl)) continue;
        for (const name of Object.getOwnPropertyNames(ctrl.prototype)) {
          const handler = ctrl.prototype[name];
          if (name === 'constructor' || !Reflect.hasMetadata('method', handler)) continue;
          const roles = reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [handler, ctrl]) ?? [];
          if (roles.includes(UserRole.EDITOR)) found.push(`${ctrl.name}.${name}`);
        }
      }
    }
    expect(found.sort()).toEqual(EXPECTED);
  });
});
