import * as bcrypt from 'bcrypt';

const saltRounds = 10;
export const hash = async (password): Promise<string> => {
    return await bcrypt.hash(password, saltRounds);
};

export const compare = async (password, hash): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};
