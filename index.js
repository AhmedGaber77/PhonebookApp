const express = require("express");
const app = express();
const fs = require("fs");
const morgan = require("morgan");
const cors = require("cors")


app.use(cors())
app.use(express.static('build'))
app.use(express.json());
// const requestLogger = (request, response, next) => {
//   console.log("Method:", request.method);
//   console.log("Path:", request.path);
//   console.log("Body:", request.body);
//   console.log("------");
//   next();
// };
// app.use(requestLogger);
// app.use(morgan("combined"));
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan.token("body", (req) => {
  if (Object.keys(req.body).length) return JSON.stringify(req.body);
  else return "-";
});

app.use(
  morgan(":method :url :status :res[content-length] :response-time ms :body")
);
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const person = persons.find((person) => person.id == req.params.id);
  if (!person) {
    return res.status(404).end("404 not found");
  }
  res.json(person);
});
app.get("/info", (req, res) => {
  const now = new Date();
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${now}</P>`);
});

app.delete("/api/persons/:id", (req, res) => {
  persons = persons.filter((person) => person.id != req.params.id);
  console.log(persons);
  res.status(204).end("deleted successfully");
});

app.post("/api/persons", (req, res) => {
  let randId = Math.floor(Math.random() * 1e9);
  if (!req.body || !req.body.name || !req.body.number) {
    return res.status(400).json({
      error: "the name or number is missing",
    });
  }

  let existingPerson = persons.find((person) => person.name === req.body.name);
  if (existingPerson) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  persons.push({
    id: randId,
    name: req.body.name,
    number: req.body.number,
  });
  console.log(req.body);
  console.log(persons);
  res.status(201).end();
});

const unknownEndPoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
