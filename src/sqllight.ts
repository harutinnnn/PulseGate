import { initDB } from './database';

async function main() {
    const db = await initDB();

    // Create a table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT
    )
  `);

    // Insert a user
    await db.run('INSERT INTO users (name, email) VALUES (?, ?)', 'John Doe', 'john@example.com');

    // Fetch users
    const users = await db.all('SELECT * FROM users');
    console.log('Current Users:', users);
}

main().catch(console.error);

import { initDB } from './database';

async function getUserById(id: number) {
    const db = await initDB();

    // db.get returns a single object
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
        console.log("User not found");
        return;
    }

    console.log("User Found:", user.name);
}

getUserById(1);