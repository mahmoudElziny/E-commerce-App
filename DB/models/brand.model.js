import  mongoose  from "../global-setup.js";

const { Schema, model } = mongoose;

const brandSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true,
        },
        logo: {
            secure_url: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
                unique: true,
            }
        },
        customId: {
            type: String,
            required: true,
            unique: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
    },
    { timestamps: true }
);


brandSchema.post("findOneAndDelete", async function () {    
    const _id = this.getQuery()._id;
    //delete relevant products from database
    await mongoose.models.Product.deleteMany({ brandId: _id });
});

export const Brand = mongoose.models.Brand || model("Brand", brandSchema);
