# API Integração de Cidades

Projeto desenvolvido para a disciplina de Tecnologias de Integração de Sistemas.

## Descrição

API REST desenvolvida em Node.js para consulta de informações geográficas e climáticas de cidades brasileiras.

## Funcionalidades

* Verificação de saúde da API (Health Check);
* Consulta de dados climáticos por cidade;
* Listagem de cidades por estado (UF);
* Tratamento de erros e validações de entrada;
* Testes automatizados utilizando Jest;
* Coleção Postman para testes manuais.

## Tecnologias Utilizadas

* Node.js
* Express.js
* Jest
* Postman

## Instalação

Clone o projeto ou faça o download dos arquivos.

Instale as dependências:

 bash
npm install
 
## Execução

Inicie a aplicação:

 bash
npm start
 
A API ficará disponível em:
  
http://localhost:3000
 
## Execução dos Testes

 bash
npm test
 
## Endpoints

### Health Check

 http
GET /api/v1/health

### Consulta de Clima

 http
GET /api/v1/clima/{cidade}
 
Exemplo:

 http
GET /api/v1/clima/Fortaleza
 
### Listagem de Cidades

 http
GET /api/v1/cidades/{UF}?limite=5
 
Exemplo:

 http
GET /api/v1/cidades/CE?limite=5
 
## Documentação Postman

A coleção Postman encontra-se disponível em:
  
docs/postman_collection.json
 
## Integrantes

Consultar o arquivo:
  
INTEGRANTES.md
 
