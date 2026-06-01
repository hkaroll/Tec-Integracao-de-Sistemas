const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares obrigatórios
app.use(cors()); // Habilita o CORS para testes no navegador
app.use(express.json()); // Garante suporte a respostas em JSON

// ==========================================
// ENDPOINT 1: Clima da Cidade (IMPLEMENTADO)
// Rota: GET /api/v1/clima/{nome_cidade}
// ==========================================
app.get('/api/v1/clima/:nome_cidade', async (req, res) => {
    const { nome_cidade } = req.params;

    // Validação do nome da cidade (mínimo 2 caracteres)
    if (!nome_cidade || nome_cidade.length < 2) {
        return res.status(400).json({
            erro: true,
            codigo: "NOME_INVALIDO",
            mensagem: "O nome da cidade deve conter pelo menos 2 caracteres",
            nome_informado: nome_cidade || ""
        });
    }

    try {
        // Passo 1: Buscar o ID da cidade na Brasil API
        const cidadeResponse = await fetch(`https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(nome_cidade)}`);
        
        // CORREÇÃO: Tratar o 404 da API externa como "Cidade não encontrada"
        if (cidadeResponse.status === 404) {
            return res.status(404).json({
                erro: true,
                codigo: "CIDADE_NAO_ENCONTRADA",
                mensagem: "Nenhuma cidade encontrada com o nome informado",
                nome_informado: nome_cidade
            });
        }

        // Se a resposta não for OK (mas não for 404), aí sim é um erro de serviço
        if (!cidadeResponse.ok) {
            throw new Error('Erro ao buscar cidade na Brasil API');
        }

        const cidades = await cidadeResponse.json();

        if (cidades.length === 0) {
            return res.status(404).json({
                erro: true,
                codigo: "CIDADE_NAO_ENCONTRADA",
                mensagem: "Nenhuma cidade encontrada com o nome informado",
                nome_informado: nome_cidade
            });
        }

        // Usar a primeira cidade encontrada
        const cidadeEncontrada = cidades[0];
        const { nome, estado, id: cidadeId } = cidadeEncontrada;

        // Passo 2: Com o ID, buscar os dados climáticos
        const climaResponse = await fetch(`https://brasilapi.com.br/api/cptec/v1/clima/previsao/${cidadeId}`);
        
        if (!climaResponse.ok) {
            throw new Error('Erro ao buscar clima na Brasil API');
        }

        const climaData = await climaResponse.json();
        
        // Pegar a previsão do dia atual (geralmente o primeiro item do array)
        const previsaoHoje = climaData.clima[0];

        // Passo 3: Combinar os dados e formatar a resposta
        const respostaFinal = {
            nome: nome,
            estado: estado,
            clima: {
                temperatura_min: previsaoHoje.min,
                temperatura_max: previsaoHoje.max,
                condicao: previsaoHoje.condicao_desc,
                unidades: {
                    temperatura: "°C"
                }
            },
            consultado_em: new Date().toISOString()
        };

        res.status(200).json(respostaFinal);

    } catch (error) {
        // Tratamento de erro para falhas na comunicação com a API externa
        console.error(error);
        res.status(503).json({
            erro: true,
            codigo: "SERVICO_EXTERNO_INDISPONIVEL",
            mensagem: "Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes",
            "servico": "Brasil API (CPTEC)"
        });
    }
});


// ==========================================
// ENDPOINT 2: Listagem de Cidades por Estado
// Rota: GET /api/v1/cidades/{sigla_uf}
// ==========================================
app.get('/api/v1/cidades/:sigla_uf', (req, res) => {
    res.status(501).json({ 
        erro: true, 
        mensagem: "Rota em desenvolvimento pelo Integrante 4." 
    });
});


// ==========================================
// ENDPOINT 3: Health Check
// Rota: GET /api/v1/health
// ==========================================
app.get('/api/v1/health', (req, res) => {
    try {
        // Formato de resposta de sucesso (HTTP 200)
        res.status(200).json({
            status: "healthy",
            versao: "1.0.0",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        // Caso ocorra algum problema interno ou serviço degradado
        res.status(200).json({
            status: "degraded",
            versao: "1.0.0",
            timestamp: new Date().toISOString(),
            motivo: "Serviço externo ou interno indisponível"
        });
    }
});


// CORREÇÃO: Iniciar o servidor apenas se o arquivo for executado diretamente
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[OK] Servidor rodando com sucesso em http://localhost:${PORT}`);
    });
}

module.exports = app; // Adicionado para permitir testes