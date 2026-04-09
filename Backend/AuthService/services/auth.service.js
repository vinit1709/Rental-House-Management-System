import User from '../models/user.model.js';

export const createUser = async ({
    name, email, password, role
}) => {
    if (!name || !email || !password || !role) {
        throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists!!")
    }

    const hashedPassword = await User.hashPassword(password);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role
    })

    return newUser;
}