import "dotenv/config";
import { initDb, seedAdmin, seedInfrastructure } from "./db/index.js";
import { createApp } from "./app.js";

const port = process.env.PORT || 3000;
const db = initDb();

const seeded = seedAdmin(db);
if (seeded) {
  console.log("Seeded default admin:", seeded.email);
}

const infraSeedCount = seedInfrastructure(db);
if (infraSeedCount > 0) {
  console.log(`Seeded ${infraSeedCount} infrastructure items`);
}

const app = createApp({ db });

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
