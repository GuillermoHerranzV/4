export const schema = `#graphql

    type Restaurant {

        id: ID!
        name: String!
        adress: String!
        city: String!
        number: String!

    }

    type Query {

        getRestaurant (id: ID): Restaurant
        getRestaurants (city: String): [Restaurant!]!

    }

    type Mutation {

        addRestaurant (name:String!, adress:String!, city:String!, number:String!): Restaurant!
        deleteRestaurant (id:ID!): Boolean!

    }

`