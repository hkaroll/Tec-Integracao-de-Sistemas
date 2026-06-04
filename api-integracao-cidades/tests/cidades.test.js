const request = require('supertest');
const app = require('../src/server');

describe('Endpoint /api/v1/cidades/{sigla_uf}', () => {

    // Teste 1: Resposta correta para uma UF válida (HTTP 200)
    it('deve retornar a lista de cidades com sucesso para uma UF válida', async () => {
        const response = await request(app)
            .get('/api/v1/cidades/CE')
            .expect(200);

        // Verifica a estrutura principal exigida no PDF
        expect(response.body).toHaveProperty('uf', 'CE');
        expect(response.body).toHaveProperty('quantidade_retornada');
        expect(response.body).toHaveProperty('cidades');
        expect(response.body).toHaveProperty('consultado_em');

        // Verifica se a lista de cidades é um array e contém objetos com o campo 'nome'
        expect(Array.isArray(response.body.cidades)).isTrue;
        if (response.body.cidades.length > 0) {
            expect(response.body.cidades[0]).toHaveProperty('nome');
        }
    });

    // Teste 2: Resposta respeitando o Query Parameter 'limite' (HTTP 200)
    it('deve respeitar o limite de cidades solicitado via query parameter', async () => {
        const limiteSolicitado = 5;
        const response = await request(app)
            .get(`/api/v1/cidades/SP?limite=${limiteSolicitado}`)
            .expect(200);

        // Verifica se a quantidade retornada bate exatamente com o limite que pedimos
        expect(response.body.quantidade_retornada).toBe(limiteSolicitado);
        expect(response.body.cidades.length).toBe(limiteSolicitado);
    });

    // Teste 3: Tratamento de erro para UF não encontrada/inexistente (HTTP 404)
    it('deve retornar erro 404 para uma sigla de UF que não existe no IBGE', async () => {
        const response = await request(app)
            .get('/api/v1/cidades/ZZ') // 'ZZ' não é um estado real
            .expect(404);

        // Verifica o padrão de erro exigido no manual
        expect(response.body).toHaveProperty('erro', true);
        expect(response.body).toHaveProperty('codigo', 'UF_NAO_ENCONTRADA');
        expect(response.body).toHaveProperty('sigla_uf_informada', 'ZZ');
    });

    // Teste 4: Tratamento de erro para formato de UF inválido (HTTP 400)
    it('deve retornar erro 400 para uma sigla de UF com tamanho inválido', async () => {
        const response = await request(app)
            .get('/api/v1/cidades/CEARA') // Passando o nome longo em vez da sigla de 2 letras
            .expect(400);

        // Verifica o padrão de erro de validação
        expect(response.body).toHaveProperty('erro', true);
        expect(response.body).toHaveProperty('codigo', 'SIGLA_UF_INVALIDA');
        expect(response.body).toHaveProperty('sigla_uf_informada', 'CEARA');
    });
});