// user.controller.ts
import { dataSource } from "../DataSource";
import { UserRepository } from "./repository";

class UserController {

    // Get all users from data source.
    async users() {
        return await UserRepository.find();
    }

    // Get a user by ID
    async user(id: number) {
        return UserRepository.findOne(id);
    }

}

export { UserController };