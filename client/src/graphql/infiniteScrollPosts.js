import gql from 'graphql-tag'
export const INFINITE_SCROLL_POSTS_QUERY = gql `
query infiniteScrollPosts ($pageNum: Int!, $pageSize: Int!) {
  infiniteScrollPosts (
    data: {
      pageNum: $pageNum,
      pageSize: $pageSize
      }) 
    {
    hasMore
    posts {
      id
        title
        description
        categories
        createdAt
        imageUrl
        likes
        messages {
          id
        }
        author {
          id
          userName
          avatar
        }
      }
  }
}`