import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usersTable } from '../db/schema';

async function main() {
  console.log('Testing database connection...');
  
  try {
    const user: typeof usersTable.$inferInsert = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    };

    // Insert a new user
    await db.insert(usersTable).values(user);
    console.log('✅ New user created!');

    // Get all users
    const users = await db.select().from(usersTable);
    console.log('✅ Getting all users from the database:', users);

    // Update user
    await db
      .update(usersTable)
      .set({ age: 31 })
      .where(eq(usersTable.email, user.email));
    console.log('✅ User info updated!');

    // Delete user (cleanup)
    await db.delete(usersTable).where(eq(usersTable.email, user.email));
    console.log('✅ User deleted!');

    console.log('🎉 Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

main(); 