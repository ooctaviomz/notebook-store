import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Servidor rodando na porta " + port);
});

dotenv.config();

const app    = Fastify({ logger: false });
const prisma = new PrismaClient();

async function start(): Promise<void> {

  // CORS — permite o frontend acessar o backend
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'DELETE'],
  });

  // Rotas
  await app.register(authRoutes);
  await app.register(productRoutes);

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));

  // Sobe o servidor
  const port = Number(process.env.PORT) || 3000;

  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log('');
    console.log('🚀 Servidor rodando em http://localhost:' + port);
    console.log('📦 Rotas disponíveis:');
    console.log('   GET    /health');
    console.log('   POST   /auth/login');
    console.log('   GET    /products      (público)');
    console.log('   POST   /products      (🔒 admin)');
    console.log('   DELETE /products/:id  (🔒 admin)');
    console.log('');
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
