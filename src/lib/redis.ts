import { RedisClient } from 'bun'; 

const client = new RedisClient(process.env.REDIS_URL); 

try {
  await client.connect(); 
} catch (error) {
  console.log('Redis Error: ', error); 
}

export const setValue = async (
  key: string, 
  value: string, 
  ttlInSecs?: number
):Promise< void > => {
  if (!ttlInSecs) {
    await client.set(key, value);
  } else {
    await client.set(key, value, 'EX', ttlInSecs); 
  }
}

export const getValue = async (
  key: string, 
):Promise< string | null > => {
  return await client.get(key); 
}

export const redisHealthCheck = async () => {
  await setValue('health', 'ok', 5); 
  const value = await getValue('health'); 

  return value === 'ok'; 
}

