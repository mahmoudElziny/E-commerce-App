

// system roles used for authorizations
export const systemRoles = {
    BUYER: "buyer",
    ADMIN: "admin",
}

const {BUYER, ADMIN} = systemRoles;

export const roles = {
    BUYER_ADMIN: [BUYER, ADMIN],
}