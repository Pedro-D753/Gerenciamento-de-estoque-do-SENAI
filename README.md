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
   No `.env`, use `DB_HOST=localhost`, `REDIS_HOST=localhost` e `MINIO_ENDPOINT=http://127.0.0.1:9000` para desenvolvimento fora do Docker. Para Docker, o Compose configura os hosts dos serviços e monta o link de redefinição como `${PUBLIC_BASE_URL}/master/redefinir-senha`; defina `PUBLIC_BASE_URL` sem barra final se usar outro domínio.
4. Inicie os serviços:
    ```bash 
    docker compose up --build
    ```

O Compose inicia a API, PostgreSQL, Redis, MinIO e as duas interfaces. Acesse:

- Master: http://localhost/master/
- Estoquista: http://localhost/estoquista/
- Documentação da API: http://localhost:8000/docs

O caminho raiz `/` redireciona para `/master/`. As requisições da API continuam disponíveis nas rotas existentes, por exemplo `http://localhost:8000/produtos/`.

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
