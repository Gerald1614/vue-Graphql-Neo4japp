import Vue from "vue";
import VueApollo from "vue-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createApolloClient, restartWebsockets } from "vue-cli-plugin-apollo/graphql-client";

import getCurrentUser from "./graphql/getCurrentUser.gql";

// Install the vue plugin
Vue.use(VueApollo);

// Name of the localStorage item
const AUTH_TOKEN = "apollo-token";

// Http endpoint
const httpEndpoint =
  process.env.VUE_APP_GRAPHQL_HTTP || "http://localhost:4000/graphql";

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  // wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink

  // Override default cache
  cache: new InMemoryCache(),
  // Override the way the Authorization header is set
  // getAuth: tokenName => {
  //   const token = localStorage.getItem(tokenName);
  //   return token || "";
  //}
  // Additional ApolloClient options
  // apollo: { ... }

  // Client local data (see apollo-link-state)
  clientState: {
    resolvers: {},
    defaults: { isLoggedIn: false },
    typeDefs: `type Query {
      isLoggedIn: Boolean
      getCurrentUser: User}`
  }
};

// Call this in the Vue app file
// export function createProvider(options = {}, { router }) {
//   // Create apollo client
//   const { apolloClient, wsClient } = createApolloClient({
//     ...defaultOptions,
//     ...options
//   });
//   apolloClient.wsClient = wsClient;
export const { apolloClient, wsClient } = createApolloClient(defaultOptions);
// Create vue apollo provider
export const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: "cache-and-network"
    }
  },
  // errorHandler(error) {
  //   console.log(
  //     "%cAn error occured",
  //     "background: red; color: white; padding: 4px; border-radius: 4px;font-weight: bold;"
  //   );
  //   console.log(error.message);
  //   if (error.graphQLErrors) {
  //     console.log(error.graphQLErrors);
  //   }
  //   if (error.networkError) {
  //     console.log(error.networkError);
  //   }
  // }
});

// }

// Manually call this when user log in
export async function onLogin(apolloClient, token) {
  if (typeof localStorage !== "undefined" && token) {
    localStorage.setItem(AUTH_TOKEN, token);
    apolloClient.writeData({
      data: { isLoggedIn: true }
    });
    apolloClient
      .query({
        query: getCurrentUser
      })
      .then(user => {
        console.log(user.data.getCurrentUser);
      });
  }
}

// Manually call this when user log out
export async function onLogout(apolloClient) {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN);
    apolloClient.writeData({
      data: { isLoggedIn: false, getCurrentUser: null }
    });
  //apolloClient.clearStore();
  };
}
// function isUnauthorizedError(error) {
//   const { graphQLErrors } = error;
//   return graphQLErrors && graphQLErrors.some(e => e.message === "Unauthorized");
// }
