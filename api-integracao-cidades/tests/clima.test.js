const request = require('supertest');
const app = require('../src/server');

describe('Endpoint /api/v1/clima/{nome_cidade}', () => {

    // Teste 1: Resposta correta para nome de cidade válido, agora com coordenadas e IBGE
    it('deve retornar os dados completos, incluindo clima, coordenadas e código IBGE', async () => {
        const response = await request(app)
            .get('/api/v1/clima/Fortaleza')
            .expect(200);

        // Verifica a estrutura principal
        expect(response.body).toHaveProperty('nome', 'Fortaleza');
        expect(response.body).toHaveProperty('estado', 'CE');
        expect(response.body).toHaveProperty('codigo_ibge');
        expect(response.body).toHaveProperty('coordenadas');
        expect(response.body).toHaveProperty('clima');
        
        // Verifica o código IBGE (não pode ser "Não encontrado")
        expect(response.body.codigo_ibge).not.toBe("Não encontrado");

        // Verifica a estrutura das coordenadas
        expect(response.body.coordenadas).toHaveProperty('latitude');
        expect(response.body.coordenadas).toHaveProperty('longitude');

        // Verifica a estrutura do clima
        expect(response.body.clima).toHaveProperty('temperatura_min');
        expect(response.body.clima).toHaveProperty('temperatura_max');
        expect(response.body.clima).toHaveProperty('condicao');
    }, 10000); // Aumenta o timeout para 10 segundos para chamadas externas

    // Teste 2: Tratamento de erro para cidade não encontrada
    it('deve retornar erro 404 para uma cidade inexistente', async () => {
        const response = await request(app)
            .get('/api/v1/clima/CidadeInexistente12345')
            .expect(404);

        expect(response.body).toHaveProperty('erro', true);
        expect(response.body).toHaveProperty('codigo', 'CIDADE_NAO_ENCONTRADA');
    });

    // Teste 3: Tratamento de erro para nome inválido
    it('deve retornar erro 400 para um nome de cidade inválido', async () => {
        const response = await request(app)
            .get('/api/v1/clima/X')
            .expect(400);

        expect(response.body).toHaveProperty('erro', true);
        expect(response.body).toHaveProperty('codigo', 'NOME_INVALIDO');
    });
});
