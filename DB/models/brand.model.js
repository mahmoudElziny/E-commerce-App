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
        creaedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: false, // TODO: change to true after adding User model (authentication)
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

export const Brand = mongoose.models.Brand || model("Brand", brandSchema);
