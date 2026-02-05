
## 1. Pré-requisitos

- Node.js versão recomendada (ex: >=18.x)
- Gerenciador de pacotes (npm ou yarn)
- Banco de dados compatível (PostgreSQL)
- Configuração de variáveis de ambiente

## 2. Clonando o Projeto

Clone o repositório:

```bash
git clone <https://github.com/Rxfinha-dev/LeadsApi.git>
cd <LeadsApi>
```

## 3. Instalando as Dependências

Utilize o gerenciador de pacotes de sua preferência:

```bash
npm install
# ou
yarn install
```

## 4. Configuração do Ambiente

Crie um arquivo `.env` com as variáveis de ambiente necessárias. Veja um exemplo genérico:

```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/nome_banco
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
# .envExample contém todas as informações
```

**Explique cada variável:**

- `DATABASE_URL`: String de conexão com o banco de dados.
- `MAIL_HOST`: Endereço do servidor de e-mail que vai autenticar e entregar suas mensagens.
- `MAIL_PORT`: Porta de comunicação.
- `MAIL_USER`: Remetente do email.
- `MAIL_PASS`: Senha de app do remetente.

## 5. Configuração do Banco de Dados

Utilizando Prisma (se aplicável):

```bash
npx prisma generate
npx prisma migrate dev
```

## 6. Rodando o Projeto

Para ambiente de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

A aplicação será executada na porta padrão (`3333`).

API base: `http://localhost:3333/`

## 7. Documentação da API

Acesse a documentação Swagger através da url:

```
http://localhost:3333/docs
```

> Lá você encontrará detalhes dos endpoints disponíveis.

## 8. Executando os Testes

Para rodar os testes unitários:

```bash
npm test
# ou
yarn test
```

Para gerar o relatório de cobertura:

```bash
npm run test -- --coverage
# ou
yarn test:coverage
```

## 9. Estrutura de Pastas

```
prisma/           # Schema e migrations do banco
src/
  modules/
    controllers/      # Controladores das rotas
    services/         # Regras de negócio
    repositories/     # Acesso a dados  
  routes/             # Definição das rotas  
  shared/  
  email/              # Arquivos do serviço de envio de email
  helpers/            # Arquivos para facilitar processos utilizados em todo o projeto      
    zipcode/          # Arquivos de validação e verificação do zipcode   
    clients/          # Clients que são usados no projeto
__tests__/            # Testes unitários 
.env.example          # Exemplo de variáveis de ambiente
```




