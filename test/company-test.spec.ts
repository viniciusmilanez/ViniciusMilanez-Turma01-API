import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('API Empresa', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const urlBase = 'https://api-desafio-qa.onrender.com/api'; // Ajuste conforme necessário
  let idEmpresa = '';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Operações de Empresa', () => {
    it('deve criar uma nova empresa', async () => {
      const resposta = await p
        .spec()
        .post(`${urlBase}/company/new`)
        .withJson({
          name: 'Empresa de Teste',
          address: '123 Rua de Teste',
          city: 'Cidade de Teste',
          country: 'País de Teste'
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({ success: true })
        .expectJsonSchema({
          type: 'object',
          properties: {
            company_id: { type: 'string' }
          },
          required: ['company_id']
        });

      idEmpresa = resposta.body.company_id;
      expect(idEmpresa).toBeDefined();
    });

    it('deve recuperar detalhes da empresa', async () => {
      await p
        .spec()
        .get(`${urlBase}/company/${idEmpresa}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ company_id: idEmpresa });
    });

    it('deve retornar 404 para empresa não existente', async () => {
      await p
        .spec()
        .get(`${urlBase}/company/id_invalido`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('deve atualizar detalhes da empresa', async () => {
      await p
        .spec()
        .put(`${urlBase}/company/${idEmpresa}`)
        .withJson({
          name: 'Empresa Atualizada',
          address: '456 Rua Atualizada'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ success: true });
    });

    it('deve recuperar detalhes atualizados da empresa', async () => {
      await p
        .spec()
        .get(`${urlBase}/company/${idEmpresa}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ name: 'Empresa Atualizada' });
    });

    it('deve deletar a empresa', async () => {
      await p
        .spec()
        .delete(`${urlBase}/company/${idEmpresa}`)
        .expectStatus(StatusCodes.NO_CONTENT);
    });

    it('deve retornar 404 para empresa deletada', async () => {
      await p
        .spec()
        .get(`${urlBase}/company/${idEmpresa}`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('deve criar outra empresa', async () => {
      const resposta = await p
        .spec()
        .post(`${urlBase}/company/new`)
        .withJson({
          name: 'Outra Empresa de Teste',
          address: '789 Outra Rua',
          city: 'Outra Cidade',
          country: 'Outro País'
        })
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({ success: true });

      idEmpresa = resposta.body.company_id;
      expect(idEmpresa).toBeDefined();
    });

    it('deve recuperar todas as empresas', async () => {
      await p
        .spec()
        .get(`${urlBase}/company`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company_id: { type: 'string' },
              name: { type: 'string' }
            },
            required: ['company_id', 'name']
          }
        });
    });

    it('deve buscar empresas pelo nome', async () => {
      await p
        .spec()
        .get(`${urlBase}/company/search?name=Outra Empresa de Teste`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([{ name: 'Outra Empresa de Teste' }]);
    });

    it('deve atualizar detalhes de outra empresa', async () => {
      await p
        .spec()
        .put(`${urlBase}/company/${idEmpresa}`)
        .withJson({
          name: 'Outra Empresa Atualizada'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ success: true });
    });

    it('deve recuperar detalhes atualizados de outra empresa', async () => {
      await p
        .spec()
        .get(`${urlBase}/company/${idEmpresa}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ name: 'Outra Empresa Atualizada' });
    });

    it('deve tratar solicitação de atualização inválida', async () => {
      await p
        .spec()
        .put(`${urlBase}/company/id_invalido`)
        .withJson({
          name: 'Atualização Inválida'
        })
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('deve criar uma empresa com campos faltantes', async () => {
      await p
        .spec()
        .post(`${urlBase}/company/new`)
        .withJson({
          address: 'Rua sem Nome',
          city: 'Cidade'
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('deve validar estrutura dos detalhes da empresa', async () => {
      await p
        .spec()
        .get(`${urlBase}/company/${idEmpresa}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            company_id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' }
          },
          required: ['company_id', 'name', 'address', 'city', 'country']
        });
    });
  });
});
