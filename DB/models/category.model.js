import  mongoose  from "../global-setup.js";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
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
        creaedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: false, // TODO: change to true after adding User model (authentication)
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
        }
    },
    { timestamps: true }
);


categorySchema.post("findOneAndDelete", async function () {    
    const _id = this.getQuery()._id;
    //delete relevant subCategories from database
    const deletedSubCategories = await mongoose.models.SubCategory.deleteMany({ categoryId: _id });
    //check if subCategories were deleted already
    if(deletedSubCategories.deletedCount){
        //delete the related brands from database
        const deletedBrands = await mongoose.models.Brand.deleteMany({ categoryId: _id });
        if(deletedBrands.deletedCount){
            //delete the related products from database
            await mongoose.models.Product.deleteMany({ categoryId: _id });            
        }
    }
});

export const Category = mongoose.models.Category || model("Category", categorySchema);
