import Dexie from "dexie";
import { Stripe } from "stripe";

export class MyAppDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  starredAccounts!: Dexie.Table<Stripe.Account, string>; // number = type of the primkey
  //...other tables goes here...

  constructor() {
    super("StarredAccounts");
    this.version(1).stores({
      starredAccounts: "&id, type, charges_enabled, payouts_enabled",
    });
  }
}

export const db = new MyAppDatabase();

const runAsync = async () => {
  const arr: Stripe.Account[] = await db.starredAccounts.toArray();
  console.log(`I have these elements: `, arr);
};
runAsync();
