import mongoose from "../global-setup.js";

const { Schema, model } = mongoose;

const userSchema = new Schema ({
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
        enum: ["Buyer", "Admin"],
    },
    age: {
        type: Number,
        required: true,
        min: 10,
        max: 100,
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        default: "Male",
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isMarkedAsDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

userSchema.pre("save", function (next) {
    if(this.isModified("password")) {
        this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
    }
    next();
});

userSchema.post("save", function(doc, next) {
    next();
});

export const User = mongoose.models.User || model("User", userSchema);