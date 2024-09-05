

export const validation = async (schema, args) => {
    const { error } = schema.validate(args, { abortEarly: false });
    if (error) {
        return error.details;
    }
    return true;
} 