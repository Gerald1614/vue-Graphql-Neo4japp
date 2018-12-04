import { neo4jgraphql } from 'neo4j-graphql-js'
 import gql from 'apollo-server'
 import uuidv4 from 'uuid/v4'
 import bcrypt from 'bcryptjs'
 import jwt from 'jsonwebtoken'

export const typeDefs = `
type User {
  _id: ID!
  userName: String! @unique
  email: String! @unique
  password: String!
  avatar: String
  joinDate: String
  favorites: [Post] @relation(name: "FAVORITES", direction: "OUT")
  posts: [Post] @relation(name: "POSTED", direction: "OUT")
}
type Post {
  _id: ID!
  title: String!
  imageUrl: String!
  categories: [String]!
  description: String!
  createdAt: String
  likes: Int
  author: User! @relation(name: "POSTED_BY", direction: "OUT")
  messages: [Message]
}
type Message {
  _id: ID!
  messageBody: String!
  messageDate: String
  messageUser: User!
}
type Query {
  AllPosts: [Post],
  AllUsers: [User]
}
type Mutation {
  CreatePost(data: CreatePostInput!): Post!
  CreateUser(data: CreateUserInput!): User!
  login(data: loginUserInput): User!
}
input loginUserInput {
  email: String!
  password: String!
}
input CreatePostInput {
  title: String!
  description: String!
  imageUrl: String!
  categories: String!
}
input CreateUserInput {
  userName: String!
  email: String!
  password: String!
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
   },
   Mutation: {
     CreatePost(object, params, ctx, resolveInfo) {
       const post = {
         ...params.data,
         createdAt : new Date().toString(),
         _id: uuidv4()
       }
       return neo4jgraphql(object,post, ctx, resolveInfo)
     },
     async CreateUser(object, params, ctx, resolveInfo) {
       if (params.data.password.length <4) {
         throw new Error('Password must be 4 characters or longer.')
       }
       const password = await bcrypt.hash(params.data.password, 10)
      
      const newUser = {
        ...params.data,
        password: password,
        _id : uuidv4()
      }
      console.log(jwt.sign({_id: newUser._id}, 'thisisasecret')) 
      return neo4jgraphql(object, newUser, ctx, resolveInfo)
      

    },
    async login(object, params, ctx, resolveInfo) {
      var session = ctx.driver.session()
      session.run('MATCH(user:User {email: {nameParam} }) RETURN user.email as email', {nameParam: params.data.email})
      .subscribe({
        onNext: function (record) {
          console.log(record.get('email'));
        },
        onCompleted: function () {
          session.close();
        },
        onError: function (error) {
          console.log(error);
        }
      })
    }
   }
 }


