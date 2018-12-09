import { neo4jgraphql } from 'neo4j-graphql-js'
 import gql from 'apollo-server'
 import bcrypt from 'bcryptjs'
 import {token} from './utils/authentication'
 import uuidv4 from 'uuid/v4'
 import getUserId from './utils/getUserId'
 import md5 from 'md5'

export const typeDefs = `
type User {
  id: ID!
  userName: String! @unique
  email: String! @unique
  password: String!
  avatar: String
  joinDate: String
  favorites: [Post] @relation(name: "FAVORITES", direction: "OUT")
  posts: [Post] @relation(name: "POSTED", direction: "OUT")
}
type Post {
  id: ID!
  title: String!
  imageUrl: String!
  categories: [String]!
  description: String!
  createdAt: String
  likes: Int
  author: User @relation(name: "POSTED", direction: "IN")
  messages: [Message]
}
type Message {
  id: ID!
  messageBody: String!
  messageDate: String
  messageUser: User!
}
type Query {
  getPosts: [Post],
  getUsers: [User]
}

type Mutation {
  CreatePost(data: CreatePostInput!): Post
  CreateUser(data: CreateUserInput!): User
  LoginUser(data: loginUserInput!): AuthPayload
}
type AuthPayload {
  token: String!
  user: User!
}
input loginUserInput {
  email: String!
  password: String!
}
input CreatePostInput {
  title: String!
  description: String!
  imageUrl: String!
  categories: [String]!
}
input CreateUserInput {
  userName: String!
  email: String!
  password: String!
}
 `;
 export const resolvers = {
   Query : {
     getPosts(object, params, ctx, resolveInfo) {
       return neo4jgraphql(object, params, ctx, resolveInfo);
     },
     getUsers(object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo);
    }
   },
   Mutation: {
     async CreatePost(object, params, ctx, resolveInfo) {
      const userId = await getUserId(ctx.req)
      console.log(params.data)
        const newPost = {
          ...params.data,
          id: uuidv4(),
          createdAt : new Date().toString(),
          likes: null,
          author: userId,
          messages: []
        }

        var session = await ctx.driver.session()
        return session.run(
          'MATCH (user:User {id: $idUser}) ' +
          'CREATE (post:Post $params) ' +
          'CREATE (user)-[rel:POSTED]->(post) ' +
          'SET user.posts = user.posts + post.id ' +
          'RETURN post',
            {'idUser': userId,
            'params': newPost} )
        .then( (result) => {
          return result.records[0]._fields[0].properties
          })
        .catch((err) => console.log(err))
     },
     async CreateUser(object, params, ctx, resolveInfo) {
       if (params.data.password.length <4) {
         throw new Error('Password must be 4 characters or longer.')
       }
       const password = await bcrypt.hash(params.data.password, 10)
        const user = {
          ...params.data,
          id: uuidv4(),
          password: password,
          avatar: `http://gravatar.com/avatar/${md5(params.data.userName)}?d=identicon`,
          joinDate: new Date().toString(),
          favorites: [],
          posts: []
        }
        console.log(token(user.id)) 
        return neo4jgraphql(object, user, ctx, resolveInfo)

    },
     async LoginUser(object, params, ctx, resolveInfo) {
      var session = await ctx.driver.session()
      return session.run('MATCH(user:User {email: $nameParam }) RETURN user as user', {nameParam: params.data.email})
      .then( async (result) => {
        var user = result.records[0]._fields[0].properties
        try {
          const isMatch = await bcrypt.compare(params.data.password, user.password);
          if (!isMatch) {
            throw new Error('Unable to login');
          }
          console.log(token(user.id));
          console.log(user);
          return {user, token: token(user.id)};
        }
        catch (err) {
          return console.log(err);
        }
    })
    .catch((err) => console.log(err))

     }
   },
  //  Post: {
  //    author: async (object, params, ctx, resolveInfo) => {
  //     const userId = await getUserId(ctx.req)
  //     var author = await ctx.driver.session()
  //     return author.run(
  //       'MATCH (user:User {id: $idUser}) ' +
  //       'RETURN user',
  //         {'idUser': userId})
  //     .then( (result) => {
  //       return result.records[0]._fields[0].properties
  //       })
  //     .catch((err) => console.log(err))
  //    }
  //  }
 }
