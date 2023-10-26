import { dataSource } from "../DataSource";
import { User } from "./user";

// user.repository.ts
export const UserRepository = dataSource.getRepository(User).extend({
    // Add custom methods here.

    // Get a user by username
    findByUsername(username: string) {
        return this.createQueryBuilder("user")
        .where("user.username = :username", { username })
        .getOne()
    },

    // Get a user by email
    findByEmail(email: string) {
        return this.createQueryBuilder("user")
        .where("user.email = :email", { email })
        .getOne()
    }

});