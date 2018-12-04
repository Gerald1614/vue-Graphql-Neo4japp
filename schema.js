import { neo4jgraphql } from 'neo4j-graphql-js'
 import gql from 'apollo-server'
 import bcrypt from 'bcryptjs'
 import jwt from 'jsonwebtoken'
 import uuidv4 from 'uuid/v4'
 import getUserId from './utils/getUserId'

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
  author: User! @relation(name: "POSTED_BY", direction: "OUT")
  messages: [Message]
}
type Message {
  id: ID!
  messageBody: String!
  messageDate: String
  messageUser: User!
}
type Query {
  AllPosts: [Post],
  AllUsers: [User]
}

type Mutation {
  CreatePost(data: CreatePostInput!): Post
  CreateUser(data: CreateUserInput!): User
  LoginUser(data: loginUserInput!): User
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
     async CreatePost(object, params, ctx, resolveInfo) {
      const userId = await getUserId(ctx.req)
       const post = {
         ...params.data,
         id: uuidv4(),
         createdAt : new Date().toString(),
       }
       neo4jgraphql(object, post, ctx, resolveInfo)
       .then((post) => {

        var session = ctx.driver.session()
        session.run(
          'MATCH (user:User) WHERE user.id = $idUser ' +
          'MATCH (post:Post) WHERE post.id = $idPost ' + 
          'MERGE (user)-[r:POSTED]->(post) ' +
          'RETURN r',
           {'idUser': userId, 'idPost': post.id} )
           .subscribe({
            onNext: function (record) {
              return record.get('r')
            },
            onCompleted: function () {
              session.close();
            },
            onError: function (error) {
              console.log(error);
            }
          })
      })
     },
     async CreateUser(object, params, ctx, resolveInfo) {
       if (params.data.password.length <4) {
         throw new Error('Password must be 4 characters or longer.')
       }
       const password = await bcrypt.hash(params.data.password, 10)
      
      const newUser = {
        ...params.data,
        id: uuidv4(),
        password: password,
      }
      console.log(jwt.sign({id: newUser.id}, 'thisisasecret')) 
      return neo4jgraphql(object, newUser, ctx, resolveInfo)
      

    },
     LoginUser(object, params, ctx, resolveInfo) {
      var session = ctx.driver.session()
      session.run('MATCH(user:User {email: $nameParam }) RETURN user as user', {nameParam: params.data.email})
      .subscribe({
        onNext: function async (record) {
          let user = record.get('user');
          bcrypt.compare(params.data.password, user.properties.password)
          .then((isMatch) =>{
            if (!isMatch) {
              throw new Error('Unable to login')
            }
            console.log(jwt.sign({id: user.properties.id}, 'thisisasecret'))
            return  object
          })
          

        },
        onCompleted: function () {
          session.close();
        },
        onError: function (error) {
          throw new Error('Unable to login');
        }
      })
    }
   }
 }


