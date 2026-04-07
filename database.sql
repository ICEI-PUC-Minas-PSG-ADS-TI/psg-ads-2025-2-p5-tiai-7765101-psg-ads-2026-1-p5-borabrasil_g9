-- ============================================================================
-- Script SQL - Bora Brasil
-- Sprint 2: Estrutura de Cache e Logs de Acesso
-- ============================================================================
-- 
-- NOTA: Como o projeto utiliza APIs externas do governo (Senado/Câmara) com
-- cache em memória (volátil), este script representa:
-- 1. Estrutura conceitual dos dados em cache
-- 2. Tabela de Log de Acesso para auditoria
-- 3. Estrutura de persistência futura (Sprint 3)
--
-- ============================================================================

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS bora_brasil_sprint2;
USE bora_brasil_sprint2;

-- ============================================================================
-- 1. CACHE DE PARLAMENTARES (Estrutura conceitual)
-- ============================================================================
-- Representa a estrutura dos dados armazenados em cache server-side

CREATE TABLE IF NOT EXISTS cache_parlamentares (
    id VARCHAR(255) PRIMARY KEY,
    casa ENUM('senado', 'camara') NOT NULL,
    nome VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255),
    partido VARCHAR(10),
    uf VARCHAR(2),
    email VARCHAR(255),
    foto_url TEXT,
    data_cache TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ttl_segundos INT DEFAULT 21600, -- 6 horas
    etag VARCHAR(255),
    last_modified VARCHAR(255),
    dados_json JSON NOT NULL,
    INDEX idx_casa (casa),
    INDEX idx_partido (partido),
    INDEX idx_uf (uf),
    INDEX idx_data_cache (data_cache)
);

-- ============================================================================
-- 2. CACHE DE VOTAÇÕES (Estrutura conceitual)
-- ============================================================================
-- Representa o cache de votações por parlamentar

CREATE TABLE IF NOT EXISTS cache_votacoes (
    id VARCHAR(255) PRIMARY KEY,
    parlamentar_id VARCHAR(255) NOT NULL,
    casa ENUM('senado', 'camara') NOT NULL,
    proposicao_id VARCHAR(255),
    descricao TEXT,
    tema_categoria VARCHAR(100),
    direcao_impacto INT, -- -1 (regressivo), 0 (neutro), 1 (progressivo)
    data_votacao TIMESTAMP,
    resultado_sim INT DEFAULT 0,
    resultado_nao INT DEFAULT 0,
    resultado_abstencao INT DEFAULT 0,
    data_cache TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ttl_segundos INT DEFAULT 3600, -- 1 hora
    dados_json JSON NOT NULL,
    INDEX idx_parlamentar (parlamentar_id),
    INDEX idx_casa (casa),
    INDEX idx_tema (tema_categoria),
    INDEX idx_data_cache (data_cache),
    FOREIGN KEY (parlamentar_id) REFERENCES cache_parlamentares(id)
);

-- ============================================================================
-- 3. LOG DE ACESSOS (Implementado - Auditoria)
-- ============================================================================
-- Registra acessos ao sistema para análise de uso e performance

CREATE TABLE IF NOT EXISTS log_acessos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL, -- /api/senadores, /api/deputados, etc.
    metodo_http VARCHAR(10) NOT NULL, -- GET, POST, etc.
    ip_usuario VARCHAR(45), -- IPv6 compatível
    user_agent TEXT,
    timestamp_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tempo_resposta_ms INT, -- Tempo de resposta em milissegundos
    cache_hit BOOLEAN DEFAULT FALSE, -- Se veio do cache
    status_http INT, -- 200, 404, 500, etc.
    parametros_busca JSON, -- Filtros, paginação, etc.
    erro_mensagem TEXT, -- Em caso de erro
    INDEX idx_endpoint (endpoint),
    INDEX idx_timestamp (timestamp_acesso),
    INDEX idx_cache_hit (cache_hit)
);

-- ============================================================================
-- 4. SCORES CALCULADOS (Implementado - Persistência de Resultados)
-- ============================================================================
-- Armazena os scores calculados para histórico e análise

CREATE TABLE IF NOT EXISTS scores_parlamentares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parlamentar_id VARCHAR(255) NOT NULL,
    casa ENUM('senado', 'camara') NOT NULL,
    score_geral DECIMAL(5,2), -- 0.00 a 100.00
    score_saude DECIMAL(5,2),
    score_educacao DECIMAL(5,2),
    score_economia DECIMAL(5,2),
    score_direitos DECIMAL(5,2),
    score_infraestrutura DECIMAL(5,2),
    total_votacoes INT DEFAULT 0,
    presenca_percentual DECIMAL(5,2),
    data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    versao_algoritmo VARCHAR(20), -- Versão do algoritmo de score
    INDEX idx_parlamentar (parlamentar_id),
    INDEX idx_casa (casa),
    INDEX idx_score_geral (score_geral),
    INDEX idx_data_calculo (data_calculo),
    FOREIGN KEY (parlamentar_id) REFERENCES cache_parlamentares(id)
);

-- ============================================================================
-- 5. SIMULAÇÕES DE IMPACTO (Implementado)
-- ============================================================================
-- Registra as simulações realizadas pelos usuários

CREATE TABLE IF NOT EXISTS simulacoes_impacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    classe_social ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
    parlamentar_id VARCHAR(255) NOT NULL,
    casa ENUM('senado', 'camara') NOT NULL,
    score_calculado DECIMAL(5,2),
    ranking_posicao INT, -- Posição no ranking
    data_simulacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_classe (classe_social),
    INDEX idx_parlamentar (parlamentar_id),
    INDEX idx_data (data_simulacao),
    FOREIGN KEY (parlamentar_id) REFERENCES cache_parlamentares(id)
);

-- ============================================================================
-- VIEWS PARA CONSULTAS COMUNS
-- ============================================================================

-- View: Ranking de Parlamentares por Score
CREATE OR REPLACE VIEW view_ranking_parlamentares AS
SELECT 
    p.id,
    p.nome,
    p.partido,
    p.uf,
    p.casa,
    s.score_geral,
    s.score_saude,
    s.score_educacao,
    s.score_economia,
    s.score_direitos,
    s.score_infraestrutura,
    s.presenca_percentual,
    RANK() OVER (ORDER BY s.score_geral DESC) as ranking_nacional,
    RANK() OVER (PARTITION BY p.uf ORDER BY s.score_geral DESC) as ranking_estadual
FROM cache_parlamentares p
JOIN scores_parlamentares s ON p.id = s.parlamentar_id
WHERE s.data_calculo = (
    SELECT MAX(data_calculo) 
    FROM scores_parlamentares 
    WHERE parlamentar_id = p.id
);

-- View: Estatísticas de Cache
CREATE OR REPLACE VIEW view_estatisticas_cache AS
SELECT 
    endpoint,
    COUNT(*) as total_acessos,
    SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) as cache_hits,
    SUM(CASE WHEN NOT cache_hit THEN 1 ELSE 0 END) as cache_misses,
    AVG(tempo_resposta_ms) as tempo_medio_ms,
    MAX(tempo_resposta_ms) as tempo_max_ms,
    MIN(tempo_resposta_ms) as tempo_min_ms
FROM log_acessos
WHERE timestamp_acesso >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY endpoint;

-- View: Top Parlamentares por Classe Social
CREATE OR REPLACE VIEW view_top_por_classe AS
SELECT 
    classe_social,
    parlamentar_id,
    p.nome,
    p.partido,
    score_calculado,
    ranking_posicao,
    data_simulacao
FROM simulacoes_impacto s
JOIN cache_parlamentares p ON s.parlamentar_id = p.id
WHERE ranking_posicao <= 3
ORDER BY classe_social, ranking_posicao;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure: Limpar cache expirado
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_limpar_cache_expirado()
BEGIN
    DELETE FROM cache_parlamentares 
    WHERE TIMESTAMPADD(SECOND, ttl_segundos, data_cache) < NOW();
    
    DELETE FROM cache_votacoes 
    WHERE TIMESTAMPADD(SECOND, ttl_segundos, data_cache) < NOW();
END //
DELIMITER ;

-- Procedure: Registrar acesso
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_registrar_acesso(
    IN p_endpoint VARCHAR(255),
    IN p_metodo VARCHAR(10),
    IN p_ip VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_tempo_ms INT,
    IN p_cache_hit BOOLEAN,
    IN p_status INT,
    IN p_parametros JSON
)
BEGIN
    INSERT INTO log_acessos (
        endpoint, metodo_http, ip_usuario, user_agent, 
        tempo_resposta_ms, cache_hit, status_http, parametros_busca
    ) VALUES (
        p_endpoint, p_metodo, p_ip, p_user_agent, 
        p_tempo_ms, p_cache_hit, p_status, p_parametros
    );
END //
DELIMITER ;

-- ============================================================================
-- INSERTS DE EXEMPLO (Dados de Teste)
-- ============================================================================

-- Exemplo: Parlamentar
INSERT INTO cache_parlamentares (id, casa, nome, nome_completo, partido, uf, email, foto_url, dados_json)
VALUES (
    'sen-1234',
    'senado',
    'João Silva',
    'João da Silva Santos',
    'PT',
    'SP',
    'joao.silva@senado.leg.br',
    'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador1234.jpg',
    '{"codigo": 1234, "nome": "João Silva", "partido": "PT", "uf": "SP"}'
);

-- Exemplo: Score
INSERT INTO scores_parlamentares (
    parlamentar_id, casa, score_geral, score_saude, score_educacao, 
    score_economia, score_direitos, score_infraestrutura, 
    total_votacoes, presenca_percentual, versao_algoritmo
)
VALUES (
    'sen-1234',
    'senado',
    85.50,
    90.00,
    88.00,
    82.00,
    87.00,
    80.00,
    45,
    92.50,
    'v1.0'
);

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

/*
EXPLICAÇÃO DAS TABELAS:

1. cache_parlamentares: 
   - Representa a estrutura dos dados em cache server-side
   - TTL (Time To Live) define tempo de validade do cache
   - dados_json armazena o objeto completo da API externa

2. cache_votacoes:
   - Cache específico para votações por parlamentar
   - Relacionamento com parlamentar via foreign key
   - Impacto calculado (-1, 0, 1) para análise

3. log_acessos:
   - Auditoria de todas as requisições
   - Métricas de performance (tempo_resposta_ms)
   - Indicador de eficiência do cache (cache_hit)

4. scores_parlamentares:
   - Persistência dos scores calculados
   - Histórico por versão do algoritmo
   - Permite análise temporal de desempenho

5. simulacoes_impacto:
   - Registro das simulações de impacto social
   - Análise por classe social (A, B, C, D, E)
   - Ranking calculado por simulação

IMPLEMENTAÇÃO ATUAL (Sprint 2):
- As tabelas 1 e 2 (cache) são mantidas em memória (In-Memory Cache)
- Não há persistência física desses dados
- Cache é recriado automaticamente quando expira

PRÓXIMA SPRINT (Sprint 3):
- Implementar persistência física das tabelas 1 e 2
- Manter tabelas 3, 4 e 5 para auditoria e análise
- Implementar sincronização automática cache <-> banco
*/

-- Fim do Script
