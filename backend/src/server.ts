import app from './app.js';
import 'dotenv/config';
import { checkDatabaseConnection } from './config/db.health.js';

const PORT = process.env.PORT;

async function startServer() {
  try {
    await checkDatabaseConnection();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

startServer();