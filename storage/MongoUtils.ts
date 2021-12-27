import mongoose from 'mongoose'
import { MongoConnectionString } from '../config/EnvironmentVariables';

async function main() {
  await mongoose.connect(MongoConnectionString);
}

main().catch(err => console.log(err));

interface Kitten {
  name: string
}
const kittenSchema = new mongoose.Schema<Kitten>({
  name: String
});

export const Kitten = mongoose.models.Kitten as mongoose.Model<Kitten> || mongoose.model<Kitten>('Kitten', kittenSchema);