import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLFloat, GraphQLBoolean, GraphQLInt, GraphQLEnumType, GraphQLList } from "graphql";
import { CouponType as CouponTypeValues } from "../../utils/index.js";


const CouponTypeEnum = new GraphQLEnumType({
    name: "CouponTypeEnum",
    description: "This is the coupon type Enum",
    values: { 
        Percentage: { value: CouponTypeValues.PERCENTAGE },
        Fixed: { value: CouponTypeValues.FIXED },
    },
}); 

// const UsersType = new GraphQLObjectType({
//     name: "UsersType",
//     description: "This is the user type",
//     fields: {
//         type: new GraphQLList(
//             new GraphQLObjectType({
//                 name: "User",
//                 description: "This is the user type",
//                 fields: {
//                     userId: { type: GraphQLID },
//                     maxCount: { type: GraphQLInt },
//                     usageCount: { type: GraphQLInt },
//                 }
//             })
//         ),
//     }
// });

export const CouponType = new GraphQLObjectType({
    name: "CouponType",
    description: "This is the coupon type",
    fields: {
        _id: { type: GraphQLID },
        couponCode: { type: GraphQLString },
        couponAmount: { type: GraphQLFloat },
        couponType: { type: CouponTypeEnum },
        from: { type: GraphQLString },
        till: { type: GraphQLString },
        // users: { type: UsersType },
        isEnabled: { type: GraphQLBoolean },
        createdBy: { type: GraphQLID },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
    },
});

export const CreateCouponArgs = {
    token: { type: GraphQLString },
    couponCode: { type: GraphQLString },
    couponAmount: { type: GraphQLFloat },
    couponType: { type: CouponTypeEnum },
    from: { type: GraphQLString },
    till: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    // users: { type: UsersType },
}