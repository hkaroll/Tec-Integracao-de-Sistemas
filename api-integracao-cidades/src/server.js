const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares obrigatórios
app.use(cors()); // Habilita o CORS para testes no navegador
app.use(express.json()); // Garante suporte a respostas em JSON

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

// ==========================================
// ESBOÇO DOS ENDPOINTS
// ==========================================

// Endpoint 1: Clima da Cidade
app.get('/api/v1/clima/:nome_cidade', (req, res) => {
    res.status(501).json({ 
        erro: true, 
        mensagem: "Rota em desenvolvimento pelos Integrantes 2 e 3." 
    });
});

// Endpoint 2: Listagem de Cidades por Estado
app.get('/api/v1/cidades/:sigla_uf', (req, res) => {
    res.status(501).json({ 
        erro: true, 
        mensagem: "Rota em desenvolvimento pelo Integrante 4." 
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`[OK] Servidor rodando com sucesso em http://localhost:${PORT}`);
});