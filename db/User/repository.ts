import { dataSource } from "../DataSource";
import { User } from "./user";

// user.repository.ts
export const UserRepository = dataSource.getRepository(User).extend({
    // Add custom methods here.

    // Get a user by username
    async findByUsername(username: string) {
        return await this.createQueryBuilder("user")
            .where("user.username = :username", { username })
            .getOne()
    },

    // Get a user by email
    async findByEmail(email: string) {
        return await this.createQueryBuilder("user")
            .where("user.email = :email", { email })
            .getOne()
    }

});