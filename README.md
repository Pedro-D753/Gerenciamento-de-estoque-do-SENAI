# Sistema de Gerenciamento de Estoque do SENAI

#### Esse sistema foi desenvolvido pelos alunos do 3º ano do Ensino Médio, no itinerário de Desenvolvimento de Sistemas de 2026, com o objetivo de gerenciar o estoque da instituição.<br><br>

# Descrição 

O SGE(Sistema de Gerenciamento de Estoque) foi desenvolvido para resolve o problema da intuição onde ela se encontrava no problema de terem vários conflitos entre as unidades da rede SENAI. 

# Tecnologias Utilizadas:
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/python-%233670A0.svg?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NodeJS](https://img.shields.io/badge/node.js-%236DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en)
![FastAPI](https://img.shields.io/badge/FastAPI-%23009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)


# Instalação

Para executar as interfaces localmente sem Docker, instale as dependências e inicie os servidores:

```bash
cd frontend
npm install
npm run dev
```

Esse comando inicia as interfaces Master e Estoquista. Se preferir executar a partir da raiz do repositório, use `npm run dev`.

Para iniciar o SGE com Docker, configure o arquivo `.env` e siga os passos abaixo:

1. Clone o repositório:
    ```bash 
    git clone https://github.com/Pedro-D753/Gerenciamento-de-estoque-do-SENAI.git SGE
    ```
2. Entra na pasta SGE:
    ```bash 
    cd SGE
    ```
3. Crie o arquivo de configuração local a partir do exemplo e preencha os dados de banco, JWT e e-mail:
    ```bash
    cp .env.example .env
    ```
   No `.env`, use `DB_HOST=localhost`, `REDIS_HOST=localhost` e `MINIO_ENDPOINT=http://127.0.0.1:9000` para desenvolvimento fora do Docker. Para executar o backend localmente usando os serviços de banco do Compose, inicie as dependências com `docker compose up -d db redis minio`; as portas necessárias ficam acessíveis apenas no próprio computador. Para executar todo o sistema em containers, o Compose configura os hosts internos dos serviços e monta o link de redefinição como `${PUBLIC_BASE_URL}/master/redefinir-senha`; defina `PUBLIC_BASE_URL` sem barra final se usar outro domínio.
4. Inicie os serviços:
    ```bash 
    docker compose up --build
    ```

O Compose inicia a API, PostgreSQL, Redis, MinIO e as duas interfaces. Acesse:

- Login único: http://localhost/login
- Master: http://localhost/master/ (após autenticar como administrador)
- Estoquista: http://localhost/estoquista/ (após autenticar como estoquista)
- Documentação da API: http://localhost:8000/docs

O backend cria e atualiza o schema do banco ao iniciar. Se executá-lo fora do Docker, inicie o PostgreSQL antes e configure `DB_HOST=localhost` no `.env`; sem um servidor PostgreSQL disponível em `DB_HOST:5432`, a inicialização da API falhará.

O caminho raiz `/` redireciona para `/login`. O perfil do usuário define automaticamente se ele será enviado para o Master ou para o Estoquista. As requisições da API continuam disponíveis nas rotas existentes, por exemplo `http://localhost:8000/produtos/`.

## Frontend em desenvolvimento

Para iniciar as duas interfaces com um único comando, entre na pasta `frontend` e execute:

```bash
npm install
npm run dev
```

O comando inicia o Master em `http://localhost:5173/master/` e o Estoquista em `http://localhost:5174/estoquista/`. Também estão disponíveis `npm run build` e `npm run lint` para executar as verificações dos dois projetos.

Para ler um código de barras pelo celular, o Estoquista gera um QR Code com uma sessão temporária identificada por hash. Em desenvolvimento, defina `VITE_PUBLIC_APP_URL` com um endereço acessível pelo celular na rede local (por exemplo, `http://192.168.0.10:5174`) antes de iniciar o frontend. O celular abre esse endereço, autoriza a câmera, lê o código e o envia automaticamente para o cadastro no computador.

# Equipe do sistema:
### Instrutor Orientador
- [Karython Gomes](https://github.com/karython)

### Desenvolvedores Backend
- [Arthur Nunes](https://github.com/NunesDevelloper)

- [Fernando Thomaz](https://github.com/Fernando-Thomaz)

- [João Vitor](https://github.com/joaovitor-afk)

### Desenvolvedores Frontend
- [Guilherme Martins](https://github.com/Guimcv1)

- [Lucas Octavio](https://github.com/LucasOctavio)

### Lider Técnico e Documentação
- [Pedro Domiense](https://github.com/Pedro-D753)
