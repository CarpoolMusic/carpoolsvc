import Knex from 'knex';
import config from '../knexfile';

const knex = Knex(config.development);

async function testDatabase(): Promise<void> {
    try {
        // Insert test data
        await knex('users').insert({ email: 'test@example.com', password_hash: 'hashed_password' });
        console.log('Insert successful');

        // Query the data
        const users = await knex('users').select('*');
        console.log('Query successful', users);

        // Update the data
        await knex('users').where('email', 'test@example.com').update({ email: 'updated@example.com' });
        console.log('Update successful');

        // Delete the data
        await knex('users').where('email', 'updated@example.com').del();
        console.log('Delete successful');

    } catch (error) {
        console.error('Error during database operations', error);
    } finally {
        await knex.destroy();
    }
}

void testDatabase();