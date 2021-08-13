import express from "express";
import winston from "winston";
import accountsRouter from "./routes/account.routes.js";
import { promises as fs } from "fs";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
//import { arquivo } from 'caminho';
import { buildSchema } from "graphql";
import { graphqlHTTP } from "express-graphql";
import AccountsService from "./services/accounts.service.js";
import Schema from "./schema/index.js";

const { readFile, writeFile } = fs;

global.filename = "accounts.json";

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label} ${level}: ${message}]`;
});

global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "my-bank-api.log" }),
  ],
  format: combine(label({ label: "my-bank-api" }), timestamp(), myFormat),
});

const schema = buildSchema(`
  type Account {
    id: Int
    name: String
    balance: Float 
  }
  input AccountInput {
    id: Int
    name: String
    balance: Float
  }
  type Query {
    getAccounts: [Account]
    getAccount(id: Int): Account
  }
  type Mutation {
    createAccount(account: AccountInput): Account
    deleteAccount(id: Int): Boolean
    updateAccount(account: AccountInput): Account
  }
`);

const root = {
  getAccounts: () => AccountsService.getAccounts(),
  getAccount(args) {
    return AccountsService.getAccount(args.id);
  },
  createAccount({ account }) {
    return AccountsService.createAccount(account);
  },
  deleteAccount(args) {
    AccountsService.deleteAccount(args.id);
  },
  updateAccount({ account }) {
    return AccountsService.updateAccount(account);
  },
};

const app = express();
app.use(express.json());
app.use(cors());
//app.use("/api", swaggerUi.serve, swaggerUi.setup(arquivo));
app.use("/account", accountsRouter);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: Schema,
    //rootValue: root,
    graphiql: true,
  })
);

app.listen(3000, async () => {
  try {
    await readFile(global.filename);
    logger.info("API started!");
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.filename, JSON.stringify(initialJson))
      .then(() => {
        logger.info("API started and File Created!");
      })
      .catch((err) => {
        logger.error(err);
      });
  }
});
