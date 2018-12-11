
import  { ApolloServer, makeExecutableSchema, gql, AuthenticationError, UserInputError }  from 'apollo-server-express'
import express from 'express'
import { typeDefs, resolvers } from './schema.js'
import { augmentSchema } from 'neo4j-graphql-js'
import { v1 as neo4j } from 'neo4j-driver';
import {NEO4J_URI, NEO4J_USER, NEO4J_PWD } from 'babel-dotenv'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});
const augmentedSchema = augmentSchema(schema);
const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PWD));

const server = new ApolloServer({
  schema: augmentedSchema,
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
})
const app = express();
server.applyMiddleware({ app });
app.listen({port: 4000}, () => 
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)