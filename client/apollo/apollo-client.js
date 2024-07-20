import { ApolloClient,InMemoryCache,createHttpLink, ApolloLink, Observable, split } from '@apollo/client';
import { Alert } from 'react-native';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import * as SecureStore from 'expo-secure-store';
import refreshToken from './refreshToken';
import { BASE_URL as ENV_BASE_URL, WEBSOCKET_LINK_PROTOCOL as ENV_WEBSOCKET_LINK_PROTOCOL} from '@env';

// Auth Link for setting the headers with the token
const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('userAccessToken');
  //console.log('Authorization Token:', token);

  return {
      headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
      }
  }
});

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: `${ENV_BASE_URL}:4000/graphql`,
  credentials: 'include', // or 'same-origin' based on your needs
});
// Web Socket 
// Function to create a new WebSocket link
const createWsLink = () => new GraphQLWsLink(createClient({
  url: `${ENV_WEBSOCKET_LINK_PROTOCOL}:4000/graphql`,
  options: {
    reconnect: true,
    lazy: true,
  },
  connectionParams: async () => {
    const token = await SecureStore.getItemAsync('userAccessToken');
    return {
        headers: {
            authorization: token ? `Bearer ${token}` : "",
        }
    }
  },
  on: {
    connected: () => console.log("connected client"),
    closed: () => console.log("closed"),
    error: (err) => {
      console.log("error wsLink apollo client: " + err.message);
      console.log("error wsLink apollo client: " + err.code);
    },
  },
}));
let wsLink = createWsLink();

// Error handling link
const errorLink = onError(({ graphQLErrors,networkError, operation, forward }) => {
  return new Observable(observer => {
    try {
      if (graphQLErrors) {
        //log error
          graphQLErrors.forEach(({ message, locations, path }) => {
            console.log(`[GraphQL Error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
          });
        //END log error

        graphQLErrors.map(async ({ message,extensions }) => {
          const errorCode = extensions?.code;
          //console.log('errorCode');
          //console.log(errorCode);

          if (errorCode === 'UNAUTHENTICATED') {
            try {
              const newAccessToken = await refreshToken();
              console.log('Token Refresh - New Access Token:', newAccessToken);

              // Update headers with the new token
              operation.setContext(({ headers }) => ({
                headers: {
                  ...headers,
                  authorization: newAccessToken ? `Bearer ${newAccessToken}` : '',
                },
              }));

              // Retry the original operation with the new token
              const subscriber = forward(operation).subscribe(observer);
              console.log('operation forward')
              // reactivate web socket 
              wsLink = createWsLink();
              // Cleanup subscriptions
              return () => subscriber.unsubscribe();
            } catch (refreshError) {
              console.error('Token Refresh - Failed:', refreshError);
              observer.error(refreshError);
            }
          }
          if(errorCode === 'USER_ALREADY_LISTED'){
            Alert.alert('User already added')
          }
          if(errorCode === 'COLLABORATOR_EMAIL_NOT_EXIST'){
            Alert.alert(`${extensions.stacktrace[0]} \n\nPlease check the email or ask to the new user to download the app and register \n\nThank you`)
          }
          if(errorCode === 'COLLABORATOR_EMAIL_SAME_AS_USER_EMAIL'){
            Alert.alert(extensions.stacktrace[0])
          }
          if(errorCode === 'USER_IS_NOT_AUTHORIZED_COMMENT'){
            Alert.alert(message)
          }
        });
      }
      if (networkError) {
        console.log('networkError', networkError);
      }
    } catch (error) {
      console.error('Error in handleAuthenticationError:', error);
      observer.error(error);
    }
  });
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  ApolloLink.from([errorLink, wsLink]),
  ApolloLink.from([errorLink, authLink.concat(httpLink)]),
);

// Apollo Client setup
const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
});

export default client;
