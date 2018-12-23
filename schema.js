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
  getCurrentUser: User,
  searchPosts(searchTerm: String!): [Post]
}

type Mutation {
  CreatePost(data: CreatePostInput!): Post
  CreateUser(data: CreateUserInput!): AuthPayload
  LoginUser(data: loginUserInput!): AuthPayload
  LikePost(postId: ID!, userId: ID!): LikesFaves!
  UnLikePost(postId: ID!, userId: ID!): LikesFaves!
  UpdateUserPost(postId: ID!, data: CreatePostInput!): Post!
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
      return  session.run(
        'MATCH (user:User {id: $nameParam }) ' +
        'OPTIONAL MATCH (user)-[:LIKES]->(favorites:Post) ' +
        'OPTIONAL MATCH (user)-[:POSTED]->(posts:Post) ' +
        'RETURN user, collect(distinct favorites) AS favorites, collect(distinct posts) AS posts', {nameParam: userId})
      .then( (result) => {
        session.close()
        let [user]= result.records.map((record) =>{
          return record.get("user").properties
        })
        let [favorites] = result.records.map((record) => {
          return record.get('favorites').map((fav) => {
            return fav.properties
          })
        })
        let [posts] = result.records.map((record)=> {
           return record.get('posts').map((post) => {
             return post.properties
           })
        })
        //alternative way of retrieving results 
      //  let favorites = result.records[0]._fields[1].map(function (record) {
      //      return record.properties
      //    })
      //    let posts = result.records[0]._fields[2].map(function (record) {
      //        return record.properties
      //    })
      console.log(favorites)
          user.favorites = favorites
          user.posts = posts
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
      session.close()
      return post
    },
    searchPosts: async (object, params, ctx, resolveInfo) => {
      const searchTerm = params.searchTerm
      if (searchTerm) {
        var session = await ctx.driver.session()
        const postsData = await session.run(
        'MATCH (p:Post) ' +
        'WHERE p.description  CONTAINS $searchTerm OR p.title CONTAINS $searchTerm ' +
        'RETURN p as posts LIMIT 5', {'searchTerm': searchTerm}
        )
        const posts = postsData.records.map(function (record) {
          return record.get("posts").properties
          })
          session.close()
        return posts;
        }
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
        session.close()
    }
 
   },
   Mutation: {
     async UpdateUserPost(object, params, ctx, resolveInfo) {
      const userId = await getUserId(ctx.req)
      const postId = params.postId
      const updatedPost = params.data
      var session = await ctx.driver.session()
      return session.run(
        'MATCH (user:User {id: $idUser}) ' +
        'MATCH (post:Post {id: $idPost}) ' +
        'SET post += {title: $params.title, description: $params.description, categories: $params.categories, imageUrl: $params.imageUrl}' +
        'RETURN post {.title, .description, .id, .imageUrl, .categories, .createdAt, .likes, ' +
        'author: user {.userName, .id, .email, .avatar} }',
          {'idUser': userId,
          'idPost': postId,
          'params': updatedPost} )
      .then( async (result) => {
        session.close()
        let [post] = await result.records.map(function (record) {
          return record.get("post")
          })
          return post
        })
      .catch((err) => console.log(err))
     },
     async LikePost(object, params, ctx, resolveInfo) {
        const postId = params.postId
        const userId = params.userId
        var session = await ctx.driver.session()
        const postData = await session.run(
        'MATCH (post:Post {id: $postId }) ' +
        'MATCH (user:User {id: $userId}) ' +
        'MERGE (user)-[rel:LIKES]->(post) ' +
        'ON CREATE SET post.likes = post.likes +1, user.favorites = user.favorites + $postId ' +
        'WITH post, user ' +
        'OPTIONAL MATCH (favorites:Post)<-[rel1:LIKES]-(toto:User {id: $userId}) ' +
        'RETURN post {.likes}, favorites', {'postId': postId, 'userId': userId})
        const [post] = postData.records.map(function (record) {
          return record.get("post")
        })
        const favorites = postData.records.map(function (record) {
          return record.get("favorites").properties
        })
        session.close()
        return {likes: post.likes, favorites}
     },
     async UnLikePost(object, params, ctx, resolveInfo) {
      const postId = params.postId
      const userId = params.userId
      var session = await ctx.driver.session()
      const postData = await session.run(
      'MATCH(post:Post {id: $postId }) ' +
      'MATCH (user:User {id: $userId}) ' +
      'WITH user, post WHERE post.likes >0 ' +
      'SET post.likes = post.likes -1, user.favorites = FILTER(x IN user.favorites WHERE x <> $postId) ' +
      'WITH user, post ' +
      'OPTIONAL MATCH (user)-[rel:LIKES]->(post) DELETE rel ' +
      'WITH user, post ' +
      'MATCH (favorites:Post)<-[rel1:LIKES]-(toto:User {id: $userId}) ' +
      'RETURN post {.likes}, favorites', {'postId': postId, 'userId': userId})
      const [post] = postData.records.map(function (record) {
        return record.get("post")
      })
      const favorites = postData.records.map(function (record) {
        return record.get("favorites").properties
      })
      session.close()
      return {likes: post.likes, favorites: favorites}
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
          session.close()
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
          session.close()
          return {user: result.records[0]._fields[0].properties, token:token(user.id)}
          })
        .catch((err) => console.log(err))
    },
     async LoginUser(object, params, ctx, resolveInfo) {
      var session = await ctx.driver.session()
      return session.run('MATCH(user:User {email: $nameParam }) RETURN user as user', {nameParam: params.data.email})
      .then( async (result) => {
        session.close()
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
