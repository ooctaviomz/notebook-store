import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LoginBody {
  email: string;
  password: string;
}

export async function authRoutes(app: FastifyInstance): Promise<void> {

  /**
   * POST /auth/login
   * Recebe { email, password } e retorna token JWT se correto.
   */
  app.post<{ Body: LoginBody }>('/auth/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'E-mail e senha são obrigatórios.' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      return reply.status(401).send({ error: 'E-mail ou senha incorretos.' });
    }

    const secret    = process.env.JWT_SECRET    || 'fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    return reply.status(200).send({ message: 'Login realizado com sucesso!', token });
  });
}
