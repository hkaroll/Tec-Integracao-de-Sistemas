const request = require('supertest');
const app = require('../src/server'); // Importa o app do seu servidor

describe('Endpoint /api/v1/clima/{nome_cidade}', () => {

    // Teste 1: Resposta correta para nome de cidade válido
    it('deve retornar os dados de clima para uma cidade válida', async () => {
        const response = await request(app)
            .get('/api/v1/clima/Fortaleza')
            .expect(200); // Espera um status HTTP 200

        // Verifica se a resposta tem os campos esperados
        expect(response.body).toHaveProperty('nome', 'Fortaleza');
        expect(response.body).toHaveProperty('estado', 'CE');
        expect(response.body).toHaveProperty('clima');
        expect(response.body.clima).toHaveProperty('temperatura_min');
        expect(response.body.clima).toHaveProperty('temperatura_max');
        expect(response.body.clima).toHaveProperty('condicao');
    });

    // Teste 2: Tratamento de erro para cidade não encontrada
    it('deve retornar erro 404 para uma cidade inexistente', async () => {
        const response = await request(app)
            .get('/api/v1/clima/CidadeInexistente12345')
            .expect(404); // Espera um status HTTP 404

        // Verifica a mensagem de erro
        expect(response.body).toHaveProperty('erro', true);
        expect(response.body).toHaveProperty('codigo', 'CIDADE_NAO_ENCONTRADA');
    });

    // Teste extra: Tratamento de erro para nome inválido
    it('deve retornar erro 400 para um nome de cidade inválido', async () => {
        const response = await request(app)
            .get('/api/v1/clima/X')
            .expect(400); // Espera um status HTTP 400

        expect(response.body).toHaveProperty('erro', true);
        expect(response.body).toHaveProperty('codigo', 'NOME_INVALIDO');
    });
});
