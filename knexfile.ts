/* eslint-disable */
import { type Knex } from 'knex';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: {
      host: 'db',
      user: 'root',
      password: 'jam',
      database: 'carpooldb'
    },
    migrations: {
      directory: './src/db/schema/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './db/schema/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
      extension: 'ts',
    },
  },
};

export default config;