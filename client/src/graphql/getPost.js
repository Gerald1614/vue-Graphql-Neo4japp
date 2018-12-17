import gql from "graphql-tag";
export const GETPOST_QUERY = gql`
  query ($postId: ID!) {
  getPost (postId: $postId){
      id
      title
      description
      categories
      createdAt
      imageUrl
      likes
      author {
        id
        userName
        avatar
      }
    }
  }`
