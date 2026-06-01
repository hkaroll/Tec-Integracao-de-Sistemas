const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares obrigatórios
app.use(cors()); // Habilita o CORS para testes no navegador
app.use(express.json()); // Garante suporte a respostas em JSON

// Função auxiliar para normalizar nomes de cidades (remover acentos e padronizar)
const normalizarNome = (nome) => {
    return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
};


// ==========================================
// ENDPOINT 1: Clima da Cidade (IMPLEMENTADO)
// Rota: GET /api/v1/clima/{nome_cidade}
// ==========================================
app.get('/api/v1/clima/:nome_cidade', async (req, res) => {
    const { nome_cidade } = req.params;

    // Validação do nome da cidade
    if (!nome_cidade || nome_cidade.length < 2) {
        return res.status(400).json({
            erro: true,
            codigo: "NOME_INVALIDO",
            mensagem: "O nome da cidade deve conter pelo menos 2 caracteres",
            nome_informado: nome_cidade || ""
        });
    }

    try {
        // Passo 1: Obter ID da cidade (para clima) e UF (para IBGE)
        const cidadeResponse = await fetch(`https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(nome_cidade)}`);
        if (cidadeResponse.status === 404) {
            return res.status(404).json({ erro: true, codigo: "CIDADE_NAO_ENCONTRADA", mensagem: "Nenhuma cidade encontrada com o nome informado (CPTEC)", nome_informado: nome_cidade });
        }
        if (!cidadeResponse.ok) throw new Error('Erro ao buscar dados da cidade na Brasil API.');
        
        const cidades = await cidadeResponse.json();
        if (cidades.length === 0) {
            return res.status(404).json({ erro: true, codigo: "CIDADE_NAO_ENCONTRADA", mensagem: "Nenhuma cidade encontrada com o nome informado", nome_informado: nome_cidade });
        }
        
        const cidadeEncontrada = cidades[0];
        const { nome, estado, id: cidadeId } = cidadeEncontrada;

        // Passo 2: Buscar dados de geolocalização e clima em paralelo
        const [geoResponse, climaResponse] = await Promise.all([
            fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nome)}&language=pt&count=1`),
            fetch(`https://brasilapi.com.br/api/cptec/v1/clima/previsao/${cidadeId}`)
        ]);

        // Validações de resposta das APIs
        if (!climaResponse.ok) throw new Error('Erro ao buscar dados de clima.');
        if (!geoResponse.ok) throw new Error('Erro ao buscar dados de geolocalização.');

        const climaData = await climaResponse.json();
        const geoData = await geoResponse.json();

        // VERIFICAÇÃO DE DADOS: Garantir que as respostas não estão vazias
        if (!geoData.results || geoData.results.length === 0) {
            return res.status(404).json({ erro: true, codigo: "COORDENADAS_NAO_ENCONTRADAS", mensagem: "Não foi possível encontrar coordenadas para a cidade informada.", nome_informado: nome });
        }
        if (!climaData.clima || climaData.clima.length === 0) {
            return res.status(404).json({ erro: true, codigo: "CLIMA_NAO_ENCONTRADO", mensagem: "Não foi possível encontrar dados climáticos para a cidade informada.", nome_informado: nome });
        }

        const previsaoHoje = climaData.clima[0];
        const localizacao = geoData.results[0];

        // Passo 3: Buscar código IBGE de forma mais robusta
        const municipiosResponse = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${estado}`);
        if (!municipiosResponse.ok) throw new Error('Erro ao buscar dados do IBGE.');
        
        const municipios = await municipiosResponse.json();
        const nomeNormalizado = normalizarNome(nome);
        const municipioEncontrado = municipios.find(m => normalizarNome(m.nome) === nomeNormalizado);

        // Passo 4: Montar a resposta final
        const respostaFinal = {
            nome: nome,
            estado: estado,
            codigo_ibge: municipioEncontrado ? municipioEncontrado.codigo_ibge : "Não encontrado",
            coordenadas: {
                latitude: localizacao.latitude,
                longitude: localizacao.longitude,
            },
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
        console.error(error);
        res.status(503).json({
            erro: true,
            codigo: "SERVICO_EXTERNO_INDISPONIVEL",
            mensagem: "Não foi possível obter dados de um dos serviços externos. Tente novamente em alguns instantes.",
            servico: error.message // Fornece uma mensagem mais específica sobre qual serviço falhou
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
        res.status(200).json({
            status: "healthy",
            versao: "1.0.0",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(200).json({
            status: "degraded",
            versao: "1.0.0",
            timestamp: new Date().toISOString(),
            motivo: "Serviço externo ou interno indisponível"
        });
    }
});


// Iniciar o servidor apenas se o arquivo for executado diretamente
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[OK] Servidor rodando com sucesso em http://localhost:${PORT}`);
    });
}

module.exports = app;