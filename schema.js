import { neo4jgraphql } from 'neo4j-graphql-js'
 import gql from 'apollo-server'

export const typeDefs = `
type User {
  userName: String! @unique
  email: String! @unique
  password: String!
  avatar: String
  joinDate: String
  favorites: String
  posts: [Post] @relation(name: "HAS_POSTED", direction: "OUT")
}
type Post {
  title: String!
  imageUrl: String
  categories: String
  description: String
  createdAt: String
  likes: String
  createdBy: User!
  messages: String
}
type Query {
  AllPosts: [Post],
  AllUsers: [User]
}
 `;
 export const resolvers = {
   Query : {
     AllPosts(object, params, ctx, resolveInfo) {
       return neo4jgraphql(object, params, ctx, resolveInfo);
     },
     AllUsers(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    }
   }
 }


