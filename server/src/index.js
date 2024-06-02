import { ApolloServer } from '@apollo/server';
import {createServer} from 'http'
import authenticateUser from './middleware/auth/auth.js'
import express from 'express';
import cors from "cors"
import { expressMiddleware } from '@apollo/server/express4';
import { PORT, IN_PROD, DB } from './config/index.js'
import mongoose from 'mongoose';
import { typeDefs ,resolvers }from './graphql/index.js';
import { refreshTokenHandler } from './middleware/auth/refreshTokenHandler.js';
import cookieParser from 'cookie-parser';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import bodyParser from 'body-parser';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {WebSocketServer} from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import redis from './redis/redisClient.js';

const DEFAULT_EXPIRATION = 3600  // 1 HOURS

/* To connect the app with MongoDB, we need mongoose */
async function startServer() {
  
  try {
    // Connect to MongoDB
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'todo_app',
    });
    console.log('Database connected');

    const redisClient = await redis.connect();

    const app = express();

   app.use(cors({
      origin: [`${process.env.BASE_URL}:4000`,`${process.env.BASE_URL}:8081`,`${process.env.BASE_URL_EXPO}:8081`,'http://localhost:4000' ], // or whatever your client's origin is
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
      optionsSuccessStatus: 204
    }));    

    app.use(bodyParser.json({ limit: '50mb', extended: true }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(cookieParser());

    // Create an Apollo Server instance
    /*  Subscription Server Setup */
    const httpServer = createServer(app);
    const schema = makeExecutableSchema( { typeDefs, resolvers } );

    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql',
    })

    const findUser = async (connectionParams) => {
      const user = authenticateUser(connectionParams);
      return user;
    };
    
    const getDynamicContext = async (ctx, msg, args) => {
      // Cache the user in the connection context
      // ctx is the graphql-ws Context where connectionParams live
       console.log(ctx.connectionParams)
      if (!ctx.connectionParams.user) {
        const currentUser = await findUser(ctx.connectionParams);
        ctx.connectionParams.user = currentUser;
      }
      return { currentUser: ctx.connectionParams.user };
    };
    
    const serverCleanup = useServer({
      schema,
      context: async (ctx, msg, args) => {
        return getDynamicContext(ctx, msg, args);
      },
    }, wsServer);
    
    const server = new ApolloServer({
      /* Subscription Server Setup */
      schema,
      typeDefs,
      resolvers,
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
      /* END Subscription Server Setup */
      /* END Subscription Server Setup */
      playground: true,
      introspection: true,  //  might be disabled in production
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
      uploads: true,
      
    });

    await server.start();
  
 
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    app.post('/refreshtoken', refreshTokenHandler); // Endpoint for refreshing tokens
   
    app.use(graphqlUploadExpress());
 
    app.use("/graphql", expressMiddleware(server, {
      context: async ({ req, res }) => {
            // List of operations that do not require authentication as from client sent
            const unauthenticatedOperations = ['CreateUser', 'LoginUser'];
            // Get the GraphQL operation name from the request
            const operationName = req.body.operationName;
            // Check if the operation requires authentication
            const requiresAuthentication = unauthenticatedOperations.includes(operationName);
            // Authenticate the user only if required
            const user = !requiresAuthentication ? authenticateUser(req) : null;
            /* to make work the playground login first time than comment line above and decomment follow one */
            //const user = requiresAuthentication ? authenticateUser(req) : null;
            if(user != null){
                // redis cache 
                try {
                  const key = `user:${user._id}`;
                  await redisClient.hSet(key, 'fullname', user.fullname);
                  await redisClient.hSet(key, 'email', user.email);
                  await redisClient.expire(key, DEFAULT_EXPIRATION);  
                } catch (redisErr) {
                  console.error("Redis Error:", redisErr);
                } 
                // END redis cache
            }
            const other = 'otherServiceMiddle(req)' // this just for example to show we can pass more stuff in the context
            return {user , other, req , res}
      },
    })) 

    /* app.listen(PORT, () => {
      console.log(`Express is running at http://localhost:${PORT}`);
      console.log(`Graphql is running at http://localhost:${PORT}/graphql`);
    }); */
    httpServer.listen(PORT, () => {
      console.log(`Express is running at http://localhost:${PORT}`);
      console.log(`GraphQL is running at http://localhost:${PORT}/graphql`);
      console.log(`WebSocket server is running at ws://localhost:${PORT}/graphql`);
    });
 
  
  } catch (error) {
    console.error(error);
  }
}

startServer();
