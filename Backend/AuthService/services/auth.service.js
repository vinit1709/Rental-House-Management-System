import User from '../models/user.model.js';

export const createUser = async ({
    // name, email, phone, password, role
    name, email, password, role
}) => {
    // if (!name || !email || !phone || !password || !role) {
    if (!name || !email || !password || !role) {
        throw new Error("All fields are required");
    }

    // const userExists = await User.findOne({ email, phone });
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists!!")
    }

    const hashedPassword = await User.hashPassword(password);
    const newUser = await User.create({
        name,
        email,
        // phone,
        password: hashedPassword,
        role
    })

    return newUser;
}