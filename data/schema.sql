DROP TABLE IF EXISTS test;

CREATE TABLE test(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    auther VARCHAR(255),
    img_url VARCHAR(255),
    description TEXT
);