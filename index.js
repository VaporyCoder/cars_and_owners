const pg = require("pg");
const client = new pg.Client("postgres://localhost/cars_and_owners_db");
const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

const homePage = path.join(__dirname, "index.html");
app.get("/", (req, res) => res.sendFile(homePage));

const reactApp = path.join(__dirname, "dist/main.js");
app.get("/dist/main.js", (req, res) => res.sendFile(reactApp));

const reactSourceMap = path.join(__dirname, "dist/main.js.map");
app.get("/dist/main.js.map", (req, res) => res.sendFile(reactSourceMap));

const styleSheet = path.join(__dirname, "styles.css");
app.get("/styles.css", (req, res) => res.sendFile(styleSheet));

app.put("/api/cars/:id", async (req, res, next) => {
  try {
    const SQL = `
    UPDATE cars
    SET owner_id = $1, name = $2
    WHERE id = $3 RETURNING *
    `;
    const response = await client.query(SQL, [
      req.body.owner_id,
      req.body.name,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/cars", async (req, res, next) => {
  try {
    const response = await client.query("SELECT * FROM cars");
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/owners", async (req, res, next) => {
  try {
    const response = await client.query("SELECT * FROM owners");
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  const SQL = `
  DROP TABLE IF EXISTS cars;
  DROP TABLE IF EXISTS owners;
    CREATE TABLE owners(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE
    );
    CREATE TABLE cars(
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE,
      owner_id INTEGER REFERENCES owners(id)
    );
    INSERT INTO owners(name) VALUES ('tom');
    INSERT INTO owners(name) VALUES ('jerry');
    INSERT INTO owners(name) VALUES ('ethan');
    INSERT INTO owners(name) VALUES ('ryan');
    INSERT INTO owners(name) VALUES ('paul');
    INSERT INTO owners(name) VALUES ('frank');
    INSERT INTO cars(name, owner_id) VALUES ('mazda rx-7 fc',(SELECT id FROM owners WHERE name='tom'));
    INSERT INTO cars(name, owner_id) VALUES ('nissan 370z nismo',(SELECT id FROM owners WHERE name='tom'));
    INSERT INTO cars(name) VALUES ('nissan silvia s15');
    INSERT INTO cars(name) VALUES ('corvette grand sport c6');
  `;
  await client.query(SQL);
  console.log("create your tables and seed data");

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

init();
