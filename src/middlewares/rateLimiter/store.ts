import redisClient from "../../redisClient";

const get = async (key: string): Promise<[number, number]> => {
    return redisClient.getNumberWithTTL(key)
}

const set = async (key: string, value: number, expire: number): Promise<string> => {
    return redisClient.set(key, value, "EX", expire);
}
const decrBy = async (key: string, value: number): Promise<number> => {
    return redisClient.decrby(key, value);
}

const store = {
    get,
    set,
    decrBy
}

export default store