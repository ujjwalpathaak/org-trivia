import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async getUser(email) {
        return await this.authRepository.getUserByEmail(email);
    }

    generateToken(user, isAdmin) {
        return jwt.sign(
            { id: user._id, user: user, role: isAdmin ? "Admin" : "Employee" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
    }

    async createHash(password, strength) {
        return await bcrypt.hash(password, strength);
    }

    async passwordsMatch(password, userPassword) {
        return await bcrypt.compare(password, userPassword);
    }

    async registerUser(user) {
        return await this.authRepository.saveUser(user);
    }

    async createUser(UserModel, email, password, name, org) {
        const hashedPassword = await this.authService.createHash(password, 10);

        const newUser = new UserModel({ email, password: hashedPassword, name, org });
        await this.authRepository.saveUser(newUser);
    }
}

export default AuthService;
