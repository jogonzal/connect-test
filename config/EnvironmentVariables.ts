import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    console.log('Loading environment variables from .env')
    dotenv.config();
} else {
    console.log('Not loading environment variables from env')
}

if (!process.env.mongo_connection_string) {
    throw new Error('Mongo connection string env variable not present')
}
export const MongoConnectionString = process.env.mongo_connection_string