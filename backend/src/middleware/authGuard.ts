import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

/**
 * Middleware de proteção de rotas.
 * Verifica se o token JWT é válido antes de liberar o acesso.
 */
export async function authGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Token não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    jwt.verify(token, secret);
  } catch {
    reply.status(401).send({ error: 'Token inválido ou expirado. Faça login novamente.' });
  }
}
