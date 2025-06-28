import type { OptionalId } from "mongodb";

export type RestaurantModel = OptionalId<{

    name: string;
    adress: string;
    city: string;
    number: string;

}>

export type Restaurant = {

    id: string
    adress: string;
    city: string;
    number: string;

}