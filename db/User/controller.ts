// user.controller.ts
import { UserRepository } from "./repository";
import type { User } from './user.ts'

class UserController {

    // Get all users from data source.
    async users(): Promise<User[]> {
        return await UserRepository.find();
    }

    // Get a user by ID
    async user(id: number): Promise<User | null> {
        return await UserRepository.findOne({ where: { id } });
    }

}

export { UserController };