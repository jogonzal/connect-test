import mongoose from 'mongoose'
import { MongoConnectionString } from '../config/EnvironmentVariables';

async function main() {
  await mongoose.connect(MongoConnectionString);
}

main().catch(err => console.log(err));

export interface Kitten {
  name: string
}
const kittenSchema = new mongoose.Schema({
  name: String
});

export const Kitten = mongoose.models.Kitten || mongoose.model<Kitten>('Kitten', kittenSchema);