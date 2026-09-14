-- Não há como fazer verificação se o banco existe no postgres
CREATE DATABASE gerenciamento_estoque;

-- -----------------------------------------------------
-- Table unidade
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS unidade(
  -- SERIAL é um int com autocomplete já inbutido para o postgres 
  id SERIAL PRIMARY KEY NOT NULL ,
  nome VARCHAR(50) NOT NULL
);

-- -----------------------------------------------------
-- Table categoria
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS categoria (
  id SERIAL PRIMARY KEY NOT NULL,
  nome VARCHAR(255) NOT NULL
);

-- -----------------------------------------------------
-- Table departamento
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS departamento (
  id SERIAL PRIMARY KEY NOT NULL,
  nome VARCHAR(255) NOT NULL
);

-- -----------------------------------------------------
-- Table produto
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS produto (
  id SERIAL PRIMARY KEY NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  unidade_medida VARCHAR(50) NOT NULL,
  codigo_barra INT NOT NULL,
  categoria_id INT NOT NULL,
  departamento_id INT NOT NULL,
 
  CONSTRAINT fk_produto_categoria
    FOREIGN KEY (categoria_id)
    REFERENCES categoria (id),
 
  CONSTRAINT fk_produto_departamento
    FOREIGN KEY (departamento_id)
    REFERENCES departamento (id)
);

-- -----------------------------------------------------
-- Table fornecedor
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS fornecedor (
  id SERIAL PRIMARY KEY NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cnpj INT NOT NULL UNIQUE,
  contato VARCHAR(120) NOT NULL,
  is_ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------
-- Table user
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY NOT NULL ,
  matricula INT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  nome VARCHAR(100) NOT NULL,
  unidade_id INT NOT NULL,

  CONSTRAINT fk_user_unidade
    FOREIGN KEY (unidade_id)
    REFERENCES unidade (id)
);

-- -----------------------------------------------------
-- Table estoque
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS estoque (
  id SERIAL PRIMARY KEY NOT NULL ,
  produto_id INT NOT NULL,
  unidade_id INT NOT NULL,
  qtd INT NOT NULL,
  qtd_minima INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  is_ativo BOOLEAN NOT NULL DEFAULT TRUE,
  localidade VARCHAR(255) NULL,
  dt_validade DATE NULL,

  CONSTRAINT fk_estoque_produto
    FOREIGN KEY (produto_id)
    REFERENCES produto (id),

  CONSTRAINT fk_estoque_unidade
    FOREIGN KEY (unidade_id)
    REFERENCES unidade (id)   
);

-- -----------------------------------------------------
-- Table registro
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS registro (
  id SERIAL PRIMARY KEY NOT NULL ,
  id_estoque INT  NOT NULL,
  is_saida BOOLEAN NOT NULL DEFAULT FALSE,
  descricao TEXT NULL,
  qtd INT NOT NULL,
  dt TIMESTAMP NOT NULL,

  CONSTRAINT fk_registro_estoque1
    FOREIGN KEY (id_estoque)
    REFERENCES estoque (id)   
);


-- -----------------------------------------------------
-- Table solicitacao
-- -----------------------------------------------------

-- -----------------------------------------------------
-- ENUM's
-- -----------------------------------------------------
CREATE TYPE solicitacao_tipo AS ENUM('SA','ST');

CREATE TYPE solicitacao_estado AS ENUM('Cancelada', 'EmAndamento', 'Concluida');

CREATE TABLE IF NOT EXISTS solicitacao (
  id SERIAL PRIMARY KEY NOT NULL,
  is_aceito BOOLEAN NOT NULL DEFAULT TRUE,
  descriacao TEXT NULL,
  tipo solicitacao_tipo NOT NULL DEFAULT 'SA',
  qtd_acao INT NOT NULL,
  dt_acao TIMESTAMP NOT NULL DEFAULT now(),
  estado solicitacao_estado
);

-- -----------------------------------------------------
-- Table estoque_solicitacao
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS estoque_solicitacao (
  id SERIAL PRIMARY KEY NOT NULL,
  id_estoque INT NOT NULL,
  id_solicitacao INT NOT NULL,

  CONSTRAINT fk_estoque_has_solicitacao_estoque
    FOREIGN KEY (id_estoque)
    REFERENCES estoque (id),
    
  CONSTRAINT fk_estoque_has_solicitacao_solicitacao
    FOREIGN KEY (id_solicitacao)
    REFERENCES solicitacao (id)   
);

-- -----------------------------------------------------
-- Table contrato
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS contrato (
  id SERIAL PRIMARY KEY NOT NULL,
  id_registro INT NOT NULL,
  id_fornecedor INT NOT NULL,
  dt_inicio DATE NOT NULL,
  dt_final DATE NOT NULL,

  CONSTRAINT fk_registro_has_fornecedor_registro
    FOREIGN KEY (id_registro)
    REFERENCES registro (id),

  CONSTRAINT fk_registro_has_fornecedor_fornecedor
    FOREIGN KEY (id_fornecedor)
    REFERENCES fornecedor (id)
);


