CREATE TABLE Users(
    id serial PRIMARY KEY,
    username VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (255) NOT NULL,
    created_on TIMESTAMP NOT NULL
);

CREATE TABLE words (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    ch varchar(255) NOT NULL,
    fr varchar(255) NOT NULL,
    pinyin varchar(255) NOT NULL,
    box integer, /*From fr to simplified chinese*/
    date date,
    box_pinyin integer, /*From simplified chinese to pinyin*/
    date_pinyin date
);