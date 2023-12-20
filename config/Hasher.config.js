import bcrypt from "bcrypt";

export const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(password, salt);
    return encryptedPassword;
}

export const verifyPassword = (password, encryptedPassword) => {
    const isPasswordMatch = bcrypt.compareSync(password, encryptedPassword);
    return isPasswordMatch;
};

// console.log(encryptPassword('password'))