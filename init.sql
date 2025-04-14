-- Criação do banco
CREATE DATABASE controle_ponto;
\c controle_ponto;

-- Tabela de funcionários
CREATE TABLE funcionarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cargo VARCHAR(255),
  departamento VARCHAR(255),
  pix VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Tipo ENUM para ponto
CREATE TYPE tipo_ponto AS ENUM ('entrada', 'saida');

-- Tabela de pontos
CREATE TABLE pontos (
  id SERIAL PRIMARY KEY,
  funcionario_id INTEGER REFERENCES funcionarios(id),
  tipo tipo_ponto NOT NULL,
  data_hora TIMESTAMP DEFAULT NOW(),
  foto VARCHAR(255),
  assinatura VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Tabela de pagamentos
CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  funcionario_id INTEGER REFERENCES funcionarios(id) ON DELETE CASCADE,
  ponto_id INTEGER REFERENCES pontos(id) ON DELETE SET NULL,
  comprovante VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
