import { MongoClient } from 'mongodb'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import type { RestaurantModel } from "./types.ts";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts"

const Mongo_url = Deno.env.get ("MONGO_URL");

if (!Mongo_url) throw new Error ("Base de datos no encontrada");

const client = new MongoClient(Mongo_url);

const dbName = 'Prueba4';

await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const RestaurantCollection = db.collection <RestaurantModel>('Restaurantes');

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {context:async () => ({RestaurantCollection})});
console.log(`Server ready at ${url}`);
