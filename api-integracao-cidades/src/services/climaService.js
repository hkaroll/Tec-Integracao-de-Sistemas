/**
 * Serviço de integração com CPTEC (via Brasil API).
 * Responsável: Especialista em Clima — previsão e dados meteorológicos.
 */

const CPTEC_BASE_URL = 'https://brasilapi.com.br/api/cptec/v1';
const NOME_SERVICO = 'Brasil API - CPTEC';

const validarNomeCidade = (nomeCidade) => {
    if (!nomeCidade || nomeCidade.length < 2) {
        return {
            erro: true,
            codigo: 'NOME_INVALIDO',
            mensagem: 'O nome da cidade deve conter pelo menos 2 caracteres',
            nome_informado: nomeCidade || ''
        };
    }
    return null;
};

const buscarCidadeCptec = async (nomeCidade) => {
    const response = await fetch(`${CPTEC_BASE_URL}/cidade/${encodeURIComponent(nomeCidade)}`);

    if (response.status === 404) {
        return {
            sucesso: false,
            status: 404,
            body: {
                erro: true,
                codigo: 'CIDADE_NAO_ENCONTRADA',
                mensagem: 'Nenhuma cidade encontrada com o nome informado',
                nome_informado: nomeCidade
            }
        };
    }

    if (!response.ok) {
        throw new Error('CPTEC');
    }

    const cidades = await response.json();
    if (cidades.length === 0) {
        return {
            sucesso: false,
            status: 404,
            body: {
                erro: true,
                codigo: 'CIDADE_NAO_ENCONTRADA',
                mensagem: 'Nenhuma cidade encontrada com o nome informado',
                nome_informado: nomeCidade
            }
        };
    }

    return { sucesso: true, cidade: cidades[0] };
};

const buscarPrevisaoClima = async (cidadeId) => {
    const response = await fetch(`${CPTEC_BASE_URL}/clima/previsao/${cidadeId}`);

    if (!response.ok) {
        throw new Error('CPTEC');
    }

    const climaData = await response.json();
    if (!climaData.clima || climaData.clima.length === 0) {
        return { sucesso: false };
    }

    return { sucesso: true, previsao: climaData.clima[0] };
};

const formatarDadosClima = (previsaoHoje) => ({
    temperatura_min: previsaoHoje.min,
    temperatura_max: previsaoHoje.max,
    condicao: previsaoHoje.condicao_desc,
    unidades: {
        temperatura: '°C'
    }
});

const erroClimaNaoEncontrado = (nomeCidade) => ({
    erro: true,
    codigo: 'CLIMA_NAO_ENCONTRADO',
    mensagem: 'Não foi possível encontrar dados climáticos para a cidade informada.',
    nome_informado: nomeCidade
});

module.exports = {
    NOME_SERVICO,
    validarNomeCidade,
    buscarCidadeCptec,
    buscarPrevisaoClima,
    formatarDadosClima,
    erroClimaNaoEncontrado
};
