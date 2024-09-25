CREATE DATABASE commandblock;

\c commandblock;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    age INT,
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
    type VARCHAR(150) NOT NULL
);
CREATE TABLE candidacies (
    id SERIAL PRIMARY KEY,
    id_student INT NOT NULL,
    id_vacancy INT NOT NULL,
    id_company INT NOT NULL,
    iniciated BOOLEAN,
    curriculumAvaliation BOOLEAN,
    documentsManagement BOOLEAN,
    done BOOLEAN,
    hired BOOLEAN,
    description TEXT,
    cretion_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_data DATE,
    FOREIGN KEY (id_student) REFERENCES users(id),
    FOREIGN KEY (id_vacancy) REFERENCES vacancies(id),
    FOREIGN KEY (id_company) REFERENCES companies(id)
);