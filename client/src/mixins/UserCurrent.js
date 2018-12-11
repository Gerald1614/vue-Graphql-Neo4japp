import USER_CURRENT from '../graphql/getCurrentUser.gql'

// @vue/component
export default {
  apollo: {
    getCurrentUser: USER_CURRENT,
  },
}