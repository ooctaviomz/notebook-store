import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authGuard } from '../middleware/authGuard';

const prisma = new PrismaClient();

interface ProductBody {
  brand:       string;
  name:        string;
  category:    string;
  description: string;
  cpu:         string;
  ram:         string;
  ssd:         string;
  screen:      string;
  price:       number;
  priceOld:    number | null;
  isNew:       boolean;
  imgUrl:      string;
}

export async function productRoutes(app: FastifyInstance): Promise<void> {

  /**
   * GET /products — público
   */
  app.get('/products', async (_request, reply) => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return reply.status(200).send({ data: products });
  });

  /**
   * POST /products — protegido (somente admin)
   */
  app.post<{ Body: ProductBody }>(
    '/products',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const { brand, name, category, description, cpu, ram, ssd, screen,
              price, priceOld, isNew, imgUrl } = request.body;

      if (!brand || !name || !category || !price) {
        return reply.status(400).send({
          error: 'Campos obrigatórios: brand, name, category, price.'
        });
      }

      const product = await prisma.product.create({
        data: {
          brand,
          name,
          category,
          description: description || '',
          cpu:         cpu         || '',
          ram:         ram         || '',
          ssd:         ssd         || '',
          screen:      screen      || '',
          price,
          priceOld:    priceOld    ?? null,
          isNew:       isNew       ?? true,
          imgUrl:      imgUrl      || '',
        }
      });

      return reply.status(201).send({ data: product });
    }
  );

  /**
   * DELETE /products/:id — protegido (somente admin)
   */
  app.delete<{ Params: { id: string } }>(
    '/products/:id',
    { preHandler: [authGuard] },
    async (request, reply) => {
      const id = parseInt(request.params.id);

      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: 'Produto não encontrado.' });
      }

      await prisma.product.delete({ where: { id } });
      return reply.status(200).send({ message: 'Produto removido com sucesso.' });
    }
  );
}
