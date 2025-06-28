import { ObjectId, type Collection } from "mongodb";
import type { RestaurantModel } from "./types.ts";
import { GraphQLError } from "npm:graphql";


type Context = {

    RestaurantCollection: Collection <RestaurantModel>;

}

type addArgs = {

    name:string;
    adress: string;
    city: string;
    number: string;

}

const Key = Deno.env.get ("API_KEY");


export const resolvers = {

    Restaurant: {

        id: (parent: RestaurantModel) => {return parent._id?.toString()}

    },

    Query: {

        getRestaurant: async (_:unknown, args: {id: string}, ctx: Context) => {

            const mongoId = new ObjectId (args.id);

            const restaurante = await ctx.RestaurantCollection.findOne ({_id: mongoId});

            if (!restaurante) throw new GraphQLError ("No se ha encontrado el restaurante");

            const responseCountry = await fetch (`https://api.api-ninjas.com/v1/city?name=${restaurante.city}`, {headers: {'X-Api-Key':Key}})
            const country = await responseCountry.json();

            const responseWeather = await fetch (`https://api.api-ninjas.com/v1/weather?city=${restaurante.city}`, {headers: {'X-Api-Key':Key}})
            const weather = await responseWeather.json();

            const responseTime = await fetch (`https://api.api-ninjas.com/v1/timezone?city=${restaurante.city}`, {headers: {'X-Api-Key':Key}})
            const time = await responseTime.json();

            const adress = `${restaurante.adress}, ${restaurante.city}, ${country.country}`;

            return ({

                _id: restaurante._id,
                name: restaurante.name,
                adress: adress,
                number: restaurante.number,
                temperature: weather.temp,
                localTime: time.local_time,

            });

        },

        getRestaurants: async (_:unknown, args: {city: string}, ctx: Context) => {

            const restaurantesModel = await ctx.RestaurantCollection.find ({city: args.city}).toArray();

            if (!restaurantesModel) throw new GraphQLError ("No se han encontrado restaurantes en esa ciudad");

            const restaurantes = await Promise.all (restaurantesModel.map (async (res) => {

                const responseCountry = await fetch (`https://api.api-ninjas.com/v1/city?name=${res.city}`, {headers: {'X-Api-Key':Key}})
                const country = await responseCountry.json();

                const responseWeather = await fetch (`https://api.api-ninjas.com/v1/weather?city=${res.city}`, {headers: {'X-Api-Key':Key}})
                const weather = await responseWeather.json();

                const responseTime = await fetch (`https://api.api-ninjas.com/v1/timezone?city=${res.city}`, {headers: {'X-Api-Key':Key}})
                const time = await responseTime.json();

                const adress = `${res.adress}, ${res.city}, ${country.country}`;

                return ({

                    _id: res._id,
                    name: res.name,
                    adress: adress,
                    number: res.number,
                    temperature: weather.temp,
                    localTime: time.local_time,

                });

            }))

            return restaurantes;

        },

    },

    Mutation: {

        addRestaurant: async (_:unknown, args: addArgs, ctx: Context) => {

            const {name, adress, city, number} = args;

            if (!name || !adress || !city || !number) throw new GraphQLError ("Falta algún campo");

            const responsePhone = await fetch (`https://api.api-ninjas.com/v1/validatephone?number=${number}`, {headers: {'X-Api-Key':Key}})
            const phone = await responsePhone.json();

            if (!phone.is_valid) throw new GraphQLError ("El telefono introducido no es valido");

            const existe = await ctx.RestaurantCollection.findOne ({number: number});
            if (existe) throw new GraphQLError ("Ese numero ya esta registrado");

            const {insertedId} = await ctx.RestaurantCollection.insertOne ({

                name,
                adress,
                city,
                number

            });

            return ({

                _id: insertedId,
                name,
                adress,
                city,
                number

            });

        },

        deleteRestaurant: async (_:unknown, args: {id:string}, ctx:Context) => {

            const id = new ObjectId (args.id);

            const response = await ctx.RestaurantCollection.findOne({_id: id});
            if (!response) throw new GraphQLError ("No se ha encontrado ningun restaurante con ese id");

            const {deletedCount} = await ctx.RestaurantCollection.deleteOne ({_id: id});

            if (deletedCount === 0) return (false);

            return (true);

        }

    }

}