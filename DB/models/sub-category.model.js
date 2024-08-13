import mongoose from "mongoose";

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
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
    },
    { timestamps: true }
);

export const Subcategory = mongoose.models.Subcategory || model("Subcategory", subCategorySchema);
