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
  favorites: [Post] @relation(name: "LIKES", direction: "OUT")
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
type PostPage {
  posts: [Post]
  hasMore: Boolean
}
type LikesFaves {
  likes: Int
  favorites: [Post]
}
type Query {
  getPosts: [Post],
  getPost(postId: ID!): Post!,
  infiniteScrollPosts(data: infiniteScrollPostsInput): PostPage,
  getUsers: [User],
  getCurrentUser: User
}

type Mutation {
  CreatePost(data: CreatePostInput!): Post
  CreateUser(data: CreateUserInput!): AuthPayload
  LoginUser(data: loginUserInput!): AuthPayload
  LikePost(postId: ID!, userId: ID!): LikesFaves!
  UnLikePost(postId: ID!, userName: String!): LikesFaves!
}
type AuthPayload {
  token: String!
  user: User!
}
input loginUserInput {
  email: String!
  password: String!
}
input infiniteScrollPostsInput {
  pageNum: Int!
  pageSize: Int!
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
    },
    async getCurrentUser(object, params, ctx, resolveInfo) {
      const userId = await getUserId(ctx.req)
      var session = await ctx.driver.session()
      return  session.run('MATCH(user:User {id: $nameParam }) RETURN user as user', {nameParam: userId})
      .then( (result) => {
        let [user]= result.records.map(function (record) {
          return record.get("user").properties
        })
        return user
        })
      .catch((err) => console.log(err))

    },
    async getPost(object, params, ctx, resolveInfo) {
      const postId = params.postId
      var session = await ctx.driver.session()
      const postData = await session.run(
      'MATCH(post:Post {id: $postId })<-[rel:POSTED]-(user:User)  ' +
      'RETURN post {.title, .description, .id, .imageUrl, .categories, .messages, .createdAt, .likes, ' +
      'author: user {.userName, .id, .avatar} }', {'postId': postId})
      const [post] = postData.records.map(function (record) {
        return record.get("post")
      })
      console.log(post)
      return post
    },
    infiniteScrollPosts: async (object, params, ctx, resolveInfo) => {
      let posts;
      var session = await ctx.driver.session()
      if (params.data.pageNum ===1) {
        const postsData = await session.run(
          'MATCH (posts:Post)<-[rel:POSTED]-(user:User) ' +
          'RETURN posts {.title, .description, .id, .imageUrl, .categories, .messages, .createdAt, .likes, ' +
          'author: user {.userName, .id, .avatar} } ORDER BY posts.createdAt DESC LIMIT $limit', {'limit':params.data.pageSize} )
          posts = postsData.records.map(function (record) {
            return record.get("posts")
          })
      } else {
        const skips = params.data.pageSize * (params.data.pageNum-1);
        const postsData = await session.run(
          'MATCH (posts:Post)<-[rel:POSTED]-(user:User) ' +
          'RETURN posts {.title, .description, .id, .imageUrl, .categories, .messages, .createdAt, .likes, ' +
          'author: user {.userName, .id, .avatar} } ORDER BY posts.createdAt DESC ' +
        'SKIP $skips LIMIT $limit',  {'limit':params.data.pageSize, 'skips': skips} )
         posts = postsData.records.map(function (record) {
          return record.get("posts")
        })
      }
      
      const totalDocs = await session.run('MATCH (post: Post) RETURN count(post)')
        .then((result) => {
          return result.records[0]._fields[0].low
          })
        .catch((err) => console.log(err))
        const hasMore = totalDocs > params.data.pageSize * params.data.pageNum
        return { posts, hasMore }
    }
 
   },
   Mutation: {
     async LikePost(object, params, ctx, resolveInfo) {
        const postId = params.postId
        const userId = params.userId
        var session = await ctx.driver.session()
        const postData = await session.run(
        'MATCH(post:Post {id: $postId }) ' +
        'MATCH (user:User {id: $userId}) ' +
        'MATCH (posts:Post)<-[rel1:LIKES]-(user) ' +
        'MERGE (user)-[rel:LIKES]->(post) ' +
        'ON CREATE SET post.likes = post.likes + 1, user.favorites = user.favorites + $postId ' +
        'RETURN post {.likes}, posts', {'postId': postId, 'userId': userId})
        const [post] = postData.records.map(function (record) {
          return record.get("post")
        })
        const posts = postData.records.map(function (record) {
          return record.get("posts").properties
        })
        console.log({likes: post.likes, favorites: posts})
        return {likes: post.likes, favorites: posts}
     },
     async CreatePost(object, params, ctx, resolveInfo) {
      const userId = await getUserId(ctx.req)
        const newPost = {
          ...params.data,
          id: uuidv4(),
          createdAt : new Date().toString(),
          likes: 0,
          author: userId,
          messages: []
        }
        var session = await ctx.driver.session()
        return session.run(
          'MATCH (user:User {id: $idUser}) ' +
          'CREATE (post:Post $params) ' +
          'CREATE (user)-[rel:POSTED]->(post) ' +
          'SET user.posts = user.posts + post.id ' +
          'RETURN post {.title, .description, .id, .imageUrl, .categories, .createdAt, .likes, ' +
          'author: user {.userName, .id, .email, .avatar} }',
            {'idUser': userId,
            'params': newPost} )
        .then( async (result) => {
          let [post] = await result.records.map(function (record) {
            return record.get("post")
            })
            return post
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
        var session = await ctx.driver.session()
        return session.run(
          'CREATE (user:User $user) ' +
          'RETURN user',
            {'user': user} )
        .then( (result) => {
          return {user: result.records[0]._fields[0].properties, token:token(user.id)}
          })
        .catch((err) => console.log(err))
    },
     async LoginUser(object, params, ctx, resolveInfo) {
      var session = await ctx.driver.session()
      return session.run('MATCH(user:User {email: $nameParam }) RETURN user as user', {nameParam: params.data.email})
      .then( async (result) => {
        let [user] = await result.records.map(function (record) {
           return record.get("user").properties
           })
        try {
          const isMatch = await bcrypt.compare(params.data.password, user.password);
          if (!isMatch) {
            throw new Error('Unable to login');
          }
          return {user, token: token(user.id)};
        }
        catch (err) {
          return console.log(err);
        }
    })
    .catch((err) => console.log(err))

     }
   },
 }
