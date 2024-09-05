import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList } from "graphql";
import { listProductResolver, createCouponResolver } from "../resolvers/index.js";
import { ProductType, CouponType, CreateCouponArgs } from "../types/index.js";



export const mainSchema = new GraphQLSchema({
    query: new GraphQLObjectType({ 
        name: "RootQuery",
        description: "This is the root query",
        fields: {
            listProducts: {
                name: "listProducts",
                description: "query for listing all products",
                type: new GraphQLList(ProductType),
                resolve: listProductResolver 
            },
        }
    }),
    mutation: new GraphQLObjectType({ 
        name: "RootMutation",
        description: "This is the root mutation",
        fields: {
            createCoupon: {
            name: "createCoupon",
            description: "mutation for creating coupon",
            type: CouponType,
            args: CreateCouponArgs,
            resolve: createCouponResolver,
            }
        }
    }),
});