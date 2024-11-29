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
    token TEXT NOT NULL DEFAULT '',
    type VARCHAR(100)
);

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cnpj VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(125) NOT NULL
);

CREATE TABLE vacancies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    creation_time DATE,
    expiration_time DATE NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'sem candidatos',
    company_id INTEGER NOT NULL,
    type VARCHAR(150) NOT NULL,
    managed BOOLEAN DEFAULT false,
    FOREIGN KEY (company_id) REFERENCES companies(id)
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
    creation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modification_data DATE,
    FOREIGN KEY (id_student) REFERENCES users(id),
    FOREIGN KEY (id_vacancy) REFERENCES vacancies(id),
    FOREIGN KEY (id_company) REFERENCES companies(id)
);

CREATE OR REPLACE FUNCTION update_vacancy_status()
RETURNS TRIGGER AS $$
DECLARE
    candidacy_record RECORD;
BEGIN
    SELECT * INTO candidacy_record FROM candidacies WHERE id_vacancy = NEW.id_vacancy;

    IF candidacy_record.iniciated THEN
        IF candidacy_record.hired THEN
            UPDATE vacancies SET status = 'contratado' WHERE id = NEW.id_vacancy;
        ELSIF candidacy_record.done THEN
            UPDATE vacancies SET status = 'finalizada' WHERE id = NEW.id_vacancy;
        ELSIF candidacy_record.documentsManagement THEN
            UPDATE vacancies SET status = 'gerenciamento de documentos' WHERE id = NEW.id_vacancy;
        ELSIF candidacy_record.curriculumAvaliation THEN
            UPDATE vacancies SET status = 'avaliação de curriculo' WHERE id = NEW.id_vacancy;
        ELSE
            UPDATE vacancies SET status = 'iniciada' WHERE id = NEW.id_vacancy;
        END IF;
    ELSE
        UPDATE vacancies SET status = 'sem candidatos' WHERE id = NEW.id_vacancy;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER candidacy_status_update
AFTER INSERT OR UPDATE ON candidacies
FOR EACH ROW
EXECUTE FUNCTION update_vacancy_status();