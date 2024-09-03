import  mongoose  from "../global-setup.js";

const { Schema, model } = mongoose;

const subCategorySchema = new Schema(
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
        images: {
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
    },
    { timestamps: true }
);

subCategorySchema.post("findOneAndDelete", async function () {    
    const _id = this.getQuery()._id;
    //delete relevant brands from database
    const deletedBrands = await mongoose.models.Brand.deleteMany({ subCategoryId: _id });
    //check if Brands were deleted already
    if(deletedBrands.deletedCount){
        //delete the related products from database
        await mongoose.models.Product.deleteMany({ subCategoryId: _id });
    }
});


export const SubCategory = mongoose.models.SubCategory || model("SubCategory", subCategorySchema);
