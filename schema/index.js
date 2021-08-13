import { GraphQLSchema, GraphQLObjectType } from "graphql";
import AccountQueries from "./queries/account.query.js";
import AccountMutation from "./mutations/account.mutation.js";

const Schema = new GraphQLSchema({
  types: null,
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      ...AccountQueries,
    },
  }),
  mutation: new GraphQLObjectType({
    name: "RootMutation",
    fields: {
      ...AccountMutation,
    },
  }),
});

export default Schema;
