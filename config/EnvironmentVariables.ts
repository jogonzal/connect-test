import dotenv from 'dotenv'

let host: string

if (process.env.NODE_ENV !== 'production') {
    console.log('Loading environment variables from .env')
    dotenv.config();
    host = 'http://localhost:3000'
} else {
    console.log('Not loading environment variables from env')
    host = 'https://nodemongonextsample.herokuapp.com'
}

export const hostUrl = host

if (!process.env.mongo_connection_string) {
    throw new Error('Mongo connection string env variable not present')
}
export const MongoConnectionString = process.env.mongo_connection_string

if (!process.env.stripe_private_key) {
    throw new Error('Stripe private key not present')
}
export const StripePrivateKey = process.env.stripe_private_key