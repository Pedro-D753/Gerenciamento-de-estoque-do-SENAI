-- Carga de dados de desenvolvimento.
-- Execute depois de db/db.sql em um banco PostgreSQL.
-- O TRUNCATE abaixo remove os dados existentes destas tabelas.

BEGIN;

TRUNCATE TABLE
  contrato,
  estoque_solicitacao,
  registro,
  solicitacao,
  log,
  estoque,
  "user",
  fornecedor,
  produto,
  categoria,
  unidade
RESTART IDENTITY CASCADE;

INSERT INTO unidade (nome)
SELECT format('Unidade de Teste %s', n)
FROM generate_series(1, 200) AS n;

INSERT INTO categoria (nome)
SELECT format('Categoria de Teste %s', n)
FROM generate_series(1, 200) AS n;

INSERT INTO produto (
  nome,
  descricao,
  img_hash,
  unidade_medida,
  codigo_barra,
  categoria_id
)
SELECT
  format('Produto de Teste %s', n),
  format('Descricao do produto de teste %s', n),
  NULL,
  CASE n % 5
    WHEN 0 THEN 'UN'
    WHEN 1 THEN 'KG'
    WHEN 2 THEN 'L'
    WHEN 3 THEN 'M'
    ELSE 'CX'
  END,
  format('789000000%s', lpad(n::text, 4, '0')),
  n
FROM generate_series(1, 200) AS n;

INSERT INTO fornecedor (nome, cnpj, contato, is_ativo)
SELECT
  format('Fornecedor de Teste %s', n),
  100000000 + n,
  format('(61) 99999-%s', lpad(n::text, 4, '0')),
  n % 10 <> 0
FROM generate_series(1, 200) AS n;

INSERT INTO "user" (
  matricula,
  email,
  is_admin,
  is_ativo,
  nome,
  senha,
  unidade_id
)
SELECT
  format('MAT%s', lpad(n::text, 6, '0')),
  format('usuario%s@teste.senai.br', lpad(n::text, 3, '0')),
  n <= 5,
  n % 20 <> 0,
  format('Usuario de Teste %s', n),
  '$5$rounds=535000$Zccr/Dd6xfPxn08L$52EqCkheuNKPQ2knIX/rE3UAW0C0KCFWVuBdpJ.vVpD',
  ((n - 1) % 200) + 1
FROM generate_series(1, 200) AS n;

INSERT INTO estoque (
  produto_id,
  unidade_id,
  qtd,
  qtd_minima,
  preco_unitario,
  is_ativo,
  localidade,
  dt_validade
)
SELECT
  n,
  ((n - 1) % 200) + 1,
  10 + (n % 91),
  5 + (n % 11),
  round((10.00 + n * 1.25)::numeric, 2),
  n % 15 <> 0,
  format('Almoxarifado %s', ((n - 1) % 10) + 1),
  CURRENT_DATE + (n * 30)
FROM generate_series(1, 200) AS n;

INSERT INTO registro (id_estoque, is_saida, descricao, qtd, dt)
SELECT
  n,
  n % 2 = 0,
  format('Movimentacao de estoque de teste %s', n),
  1 + (n % 20),
  CURRENT_TIMESTAMP - make_interval(days => n)
FROM generate_series(1, 200) AS n;

INSERT INTO solicitacao (
  is_aceito,
  obs_solicita,
  obs_recusa,
  email_solicitador_hash,
  tipo,
  qtd_acao,
  dt_acao,
  estado
)
SELECT
  n % 10 <> 0,
  format('Solicitacao de teste %s', n),
  CASE WHEN n % 10 = 0 THEN format('Recusa da solicitacao %s', n) ELSE NULL END,
  md5(format('solicitante%s@teste.senai.br', lpad(n::text, 3, '0'))),
  CASE WHEN n % 2 = 0 THEN 'ST'::solicitacao_tipo ELSE 'SA'::solicitacao_tipo END,
  1 + (n % 15),
  CURRENT_TIMESTAMP - make_interval(hours => n),
  CASE
    WHEN n % 10 = 0 THEN 'Cancelada'::solicitacao_estado
    WHEN n % 3 = 0 THEN 'Concluida'::solicitacao_estado
    ELSE 'EmAndamento'::solicitacao_estado
  END
FROM generate_series(1, 200) AS n;

INSERT INTO estoque_solicitacao (id_estoque, id_solicitacao)
SELECT n, n
FROM generate_series(1, 200) AS n;

INSERT INTO contrato (id_registro, id_fornecedor, dt_inicio, dt_final)
SELECT
  n,
  n,
  CURRENT_DATE - (n * 10),
  CURRENT_DATE + (n * 10)
FROM generate_series(1, 200) AS n;

INSERT INTO "log" (matricula_quem_fez, acao, tb_acao, dt_acao)
SELECT
  100000 + n,
  format('Acao de teste %s', n),
  CASE n % 5
    WHEN 0 THEN 'produto'
    WHEN 1 THEN 'estoque'
    WHEN 2 THEN 'solicitacao'
    WHEN 3 THEN 'usuario'
    ELSE 'fornecedor'
  END,
  CURRENT_TIMESTAMP - make_interval(minutes => n)
FROM generate_series(1, 200) AS n;

COMMIT;

-- Conferencia: cada tabela deve retornar 200.
SELECT 'unidade' AS tabela, count(*) AS total FROM unidade
UNION ALL
SELECT 'categoria', count(*) FROM categoria
UNION ALL
SELECT 'produto', count(*) FROM produto
UNION ALL
SELECT 'fornecedor', count(*) FROM fornecedor
UNION ALL
SELECT 'user', count(*) FROM "user"
UNION ALL
SELECT 'estoque', count(*) FROM estoque
UNION ALL
SELECT 'registro', count(*) FROM registro
UNION ALL
SELECT 'solicitacao', count(*) FROM solicitacao
UNION ALL
SELECT 'estoque_solicitacao', count(*) FROM estoque_solicitacao
UNION ALL
SELECT 'contrato', count(*) FROM contrato
UNION ALL
SELECT 'log', count(*) FROM "log";
