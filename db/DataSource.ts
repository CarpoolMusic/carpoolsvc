import "reflect-metadata"

import { DataSource } from "typeorm"
import { User } from "./User/user"

// Connect to postgres db in docker container.
const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST ?? "localhost",
    port: 5432,
    username: "root",
    password: "jam",
    database: "carpooldb",
    entities: [User],
    logging: true,
    synchronize: true,
})

dataSource.initialize()
    .then(() => {
        console.log("Data source has been initialized");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    })

export { dataSource };