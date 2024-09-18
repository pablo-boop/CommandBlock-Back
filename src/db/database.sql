CREATE DATABASE commandBlock;

\c commandBlock;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    cpf VARCHAR(200) NOT NULL UNIQUE,
    course VARCHAR(150) NOT NULL,
    password TEXT NOT NULL,
    type VARCHAR(100)
);

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cnpj VARCHAR(200) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(125) NOT NULL
);

CREATE TABLE vacancies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    creation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiration_time DATE NOT NULL,
    status VARCHAR(100) NOT NULL,
    students_id INT [],
    company_id INT NOT NULL,
    FOREIGN KEY company_id REFERENCES companies(id)
);

CREATE TABLE status (
    id SERIAL PRIMARY KEY,
    iniciado BOOLEAN,
    alunoSelecionado BOOLEAN,
    avaliaçãoCurriculo BOOLEAN,
    gestãoDocumentos BOOLEAN,
    finalizado BOOLEAN,
    data_id DATE NOT NULL,
    FOREIGN KEY data_id REFERENCES vacancies(id)
);