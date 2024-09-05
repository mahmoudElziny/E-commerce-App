import { GraphQLInt, GraphQLString, GraphQLObjectType, GraphQLFloat, GraphQLID, GraphQLList, GraphQLEnumType } from "graphql";
import { DiscountTypeEnum } from "../../utils/index.js";


const ImageType = new GraphQLObjectType({
    name: "ImagesType",
    description: "Images Type", 
    fields: {
        URLs: {
            type: new GraphQLList(
            new GraphQLObjectType({
                name: "URLsType",
                description: "URLs Type",
                fields: {
                    secure_url: {type: GraphQLString},
                    public_id: {type: GraphQLString},
                    _id: {type: GraphQLID},
                }
            })
        )},
        customId: {
            type: GraphQLString
        }
        
    }
});

const DiscountType = new GraphQLObjectType({
    name: "DiscountTypeEnum",
    description: "Discount Type",
    fields: {
        amount: { type: GraphQLFloat},
        type: { type: new GraphQLEnumType({
            name: "DiscountTypeEnumEnum",
            values: {
                Percentage: {value: DiscountTypeEnum.PERCENTAGE},
                Fixed : {value: DiscountTypeEnum.FIXED}
            }
        })}
    }
});

export const ProductType = new GraphQLObjectType({
    name: "ProductType",
    description: "Product Type",
    fields: {
        _id: {type: GraphQLID},
        title: {type: GraphQLString},
        slug: {type: GraphQLString},
        price: {type: GraphQLFloat},
        appliedPrice: {type: GraphQLFloat},
        stock: {type: GraphQLInt},
        rating: {type: GraphQLFloat},
        categoryId: {type: GraphQLID},
        subCategoryId: {type: GraphQLID},
        brandId: {type: GraphQLID},
        createdAt: {type: GraphQLString},
        updatedAt: {type: GraphQLString},
        images: {
            type: ImageType 
        },
        appliedDiscount: {
            type: DiscountType
        }
    }
});



