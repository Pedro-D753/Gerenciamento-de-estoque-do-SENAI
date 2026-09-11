CREATE DATABASE IF NOT EXISTS gerenciamento_estoque;
USE gerenciamento_estoque;

-- Tabelas --

CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`unidade` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`produto` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) UNIQUE NOT NULL,
    descricao TEXT,
    unidade_medida VARCHAR(50) NOT NULL,
    -- path_foto VARCHAR(150) NOT NULL, <- pode ser substituído pelo MinIO via sw3
    codigo_barra INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`fornecedor` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) UNIQUE NOT NULL
    -- codigo_barra INT NOT NULL, <- caso o codigo de barra para o fornecedor existe --
);

CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`user` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matricula INT UNIQUE NOT NULL,
    is_admin TINYINT DEFAULT 0 NOT NULL,
    is_ativo TINYINT DEFAULT 1 NOT NULL,
    nome VARCHAR(100) NOT NULL,
    id_unidade INT NOT NULL,
    FOREIGN KEY (id_unidade) REFERENCES `gerenciamento_estoque`.`unidade`(id)
);

CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`estoque` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_unidade INT NOT NULL,
    id_produto INT NOT NULL,
    id_fornecedor INT NOT NULL,
    qtn INT NOT NULL,
    qtn_minima INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_unidade) REFERENCES `gerenciamento_estoque`.`unidade`(id),
    FOREIGN KEY (id_produto) REFERENCES `gerenciamento_estoque`.`produto`(id),
    FOREIGN KEY (id_fornecedor) REFERENCES `gerenciamento_estoque`.`fornecedor`(id)
);

CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`registro` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_estoque INT NOT NULL,
    is_saida TINYINT,
    is_aceito TINYINT,
    is_solicidado TINYINT,
    descricao TEXT,
    qtn_acao INT,
    dt_acao DATETIME DEFAULT NOW(),
    FOREIGN KEY (id_estoque) REFERENCES `gerenciamento_estoque`.`estoque`(id)
);

CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`log` ( 
    id INT PRIMARY KEY AUTO_INCREMENT,
    dt_acao DATETIME DEFAULT NOW(),
    table_sofre_acao ENUM("user","produto","fornecedor","unidade","estoque","registro") NOT NULL,
    acao VARCHAR(100) NOT NULL,
    user_matricula INT NOT NULL
);

-- Gatilhos --

DELIMITER $$

-- Gatilho para assim que for cadastrado a unidade já cadastra em fornecedor --
CREATE TRIGGER `gerenciamento_estoque`.`tg_criar_estoque_unidade`
AFTER INSERT ON `gerenciamento_estoque`.`unidade`
FOR EACH ROW
BEGIN
    INSERT INTO `gerenciamento_estoque`.`fornecedor` (nome)
    VALUES (NEW.nome);
END$$

DELIMITER ;

