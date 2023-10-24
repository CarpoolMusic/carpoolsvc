import { DataSource } from "typeorm"

// Connect to postgres db in docker container.
const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: 5432,
    username: "carpooluser",
    password: "jam",
    database: "carpooldb",
    entities: ['../src/entity/*.ts'],
    logging: true,
    synchronize: true,
})

AppDataSource.initialize()
    .then(() => {
        console.log("Data source has been initialized");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    })

export { AppDataSource };