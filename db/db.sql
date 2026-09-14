CREATE SCHEMA IF NOT EXISTS `gerenciamento_estoque` ;
USE `gerenciamento_estoque` ;

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`unidade`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`unidade` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(50) NOT NULL,
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`categoria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`categoria` (
  `id` INT PRIMARY KEY NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`departamento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`departamento` (
  `id` INT PRIMARY KEY NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`produto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`produto` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `unidade_medida` VARCHAR(50) NOT NULL,
  `codigo_barra` INT NOT NULL,
  `categoria_id` INT NOT NULL,
  `departamento_id` INT NOT NULL,
 
 
  CONSTRAINT `fk_produto_categoria`
    FOREIGN KEY (`categoria_id`)
    REFERENCES `gerenciamento_estoque`.`categoria` (`id`),
 
  CONSTRAINT `fk_produto_departamento`
    FOREIGN KEY (`departamento_id`)
    REFERENCES `gerenciamento_estoque`.`departamento` (`id`)
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`fornecedor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`fornecedor` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `cpnj` INT NOT NULL UNIQUE,
  `contato` VARCHAR(120) NOT NULL,
  `is_ativo` TINYINT NOT NULL DEFAULT 1,
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`user` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `matricula` INT NOT NULL,
  `is_admin` TINYINT NOT NULL DEFAULT 0,
  `is_ativo` TINYINT NOT NULL DEFAULT 1,
  `nome` VARCHAR(100) NOT NULL,
  `unidade_id` INT NOT NULL,

  CONSTRAINT `fk_user_unidade`
    FOREIGN KEY (`unidade_id`)
    REFERENCES `gerenciamento_estoque`.`unidade` (`id`)
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`estoque`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`estoque` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `produto_id` INT NOT NULL,
  `unidade_id` INT NOT NULL,
  `qtd` INT NOT NULL,
  `qtd_minima` INT NOT NULL,
  `preco_unitario` DECIMAL(10,2) NOT NULL,
  `is_ativo` TINYINT NOT NULL DEFAULT 1,
  `localidade` VARCHAR(255) NULL,
  `dt_validade` DATE NULL,

  CONSTRAINT `fk_estoque_produto`
    FOREIGN KEY (`produto_id`)
    REFERENCES `gerenciamento_estoque`.`produto` (`id`),

  CONSTRAINT `fk_estoque_unidade`
    FOREIGN KEY (`unidade_id`)
    REFERENCES `gerenciamento_estoque`.`unidade` (`id`)   
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`registro`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`registro` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `id_estoque` INT NOT NULL,
  `is_saida` TINYINT NOT NULL DEFAULT 0,
  `descricao` TEXT NULL,
  `qtd` INT NOT NULL,
  `dt` DATETIME NOT NULL,

  CONSTRAINT `fk_registro_estoque1`
    FOREIGN KEY (`id_estoque`)
    REFERENCES `gerenciamento_estoque`.`estoque` (`id`)   
);


-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`log` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `dt_acao` DATETIME NULL DEFAULT NOW(),
  `table_sofre_acao` ENUM("user", "produto", "fornecedor", "unidade", "estoque", "registro") NOT NULL,
  `acao` VARCHAR(100) NOT NULL,
  `user_matricula` INT NOT NULL,
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`solicitacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`solicitacao` (
  `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `is_aceito` TINYINT NOT NULL DEFAULT 1,
  `descriacao` TEXT NULL,
  `tipo` ENUM("SA", "ST") NOT NULL DEFAULT 'SA',
  `qtd_acao` INT NOT NULL,
  `dt_acao` DATETIME NOT NULL DEFAULT now(),
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`estoque_solicitacao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`estoque_solicitacao` (
  `id` INT PRIMARY KEY NOT NULL,
  `id_estoque` INT NOT NULL,
  `id_solicitacao` INT NOT NULL,


  CONSTRAINT `fk_estoque_has_solicitacao_estoque`
    FOREIGN KEY (`id_estoque`)
    REFERENCES `gerenciamento_estoque`.`estoque` (`id`),
    
  CONSTRAINT `fk_estoque_has_solicitacao_solicitacao`
    FOREIGN KEY (`id_solicitacao`)
    REFERENCES `gerenciamento_estoque`.`solicitacao` (`id`)   
);

-- -----------------------------------------------------
-- Table `gerenciamento_estoque`.`contrato`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gerenciamento_estoque`.`contrato` (
  `id` INT PRIMARY KEY NOT NULL,
  `id_registro` INT NOT NULL,
  `id_fornecedor` INT NOT NULL,
  `dt_inicio` DATE NOT NULL,
  `dt_final` DATE NOT NULL,

  CONSTRAINT `fk_registro_has_fornecedor_registro`
    FOREIGN KEY (`id_registro`)
    REFERENCES `gerenciamento_estoque`.`registro` (`id`),

  CONSTRAINT `fk_registro_has_fornecedor_fornecedor`
    FOREIGN KEY (`id_fornecedor`)
    REFERENCES `gerenciamento_estoque`.`fornecedor` (`id`)
);


