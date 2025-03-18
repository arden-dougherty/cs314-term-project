import request from "supertest";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import { app } from "../src";

// bypass middleware
jest.mock("../src/middleware/auth.middleware", () => ({protectRoute: async (req, res, next) => {
    req.user = req.body.user;
    next();
}}));

describe ("POST /api/auth/signup", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it("should create a user and return 201 if email/password are valid", async () => {
        const res = await request(app).post("/api/auth/signup").send({ email: "test@email.com", password: "123" });

        expect(res.status).toBe(201);
        
        const userInDb = await User.findOne({ email: "test@email.com" });
        expect(userInDb).not.toBeNull();
    });

    it("should return 409 if email is already registered", async () => {
        await User.create({ email: "test@email.com", password: "123"});

        const res = await request(app).post("/api/auth/signup").send({ email: "test@email.com", password: "456"});

        expect(res.status).toBe(409);
        expect(res.body.message).toBe("An account already exists with this email");
    });

    it("should return 400 if email or password is missing", async () => {
        let res = await request(app).post("/api/auth/signup").send({ email: "test@email.com" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("All fields are required");

        res = await request(app).post("/api/auth/signup").send({ password: "123" });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("All fields are required");
    });
});

describe ("POST /api/auth/login", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it("should return 200 if there is a matching user", async () => {
        //await User.create({ email: "test@email.com", password: "123" });
        await request(app).post("/api/auth/signup").send({ email: "test@email.com", password: "123" });

        const res = await request(app).post("/api/auth/login").send({ email: "test@email.com", password: "123" });

        expect(res.status).toBe(200);

        //const user = await User.findOne({email: "test@email.com"});
        //expect(res.body.user.id).toBe(user._id);
    });

    it("should return 404 if there is no matching user", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: "test@email.com", password: "123" });

        expect(res.status).toBe(404);
    });

    it("should return 400 if password is invalid", async () => {
        await request(app).post("/api/auth/signup").send({ email: "test@email.com", password: "123" });

        const res = await request(app).post("/api/auth/login").send({ email: "test@email.com", password: "456" });

        expect(res.status).toBe(400);
    });

    it("should return 400 if email or password is missing", async () => {
        let res = await request(app).post("/api/auth/login").send({ email: "test@email.com" });
        expect(res.status).toBe(400);

        res = await request(app).post("/api/auth/login").send({ password: "123" });
        expect(res.status).toBe(400);
    });
});

describe ("POST /api/auth/logout", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it("should return 200 and remove cookies", async () => {
        const res = await request(app).post("/api/auth/logout").send();

        expect(res.status).toBe(200);
        // test no cookies?
    });
});

describe ("POST /api/auth/update-profile", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it("should return 200 and change first and last name if there is a matching user", async () => {
        await User.create({ email: "test@email.com", password: "123"});

        let user = await User.findOne({email: "test@email.com"});
        const res = await request(app).post("/api/auth/update-profile/").send({firstName: "John", lastName: "Doe", user:user});

        user = await User.findOne({email: "test@email.com"});
        expect(res.status).toBe(200);
        expect(user.firstName).toBe("John");
        expect(user.lastName).toBe("Doe");
    });

    it("should return 400 if first or last name is missing", async () => {
        await User.create({ email: "test@email.com", password: "123"});

        let user = await User.findOne({email: "test@email.com"});
        
        let res = await request(app).post("/api/auth/update-profile/").send({firstName: "John", user:user});
        expect(res.status).toBe(400)

        res = await request(app).post("/api/auth/update-profile/").send({lastName: "Doe", user:user});
        expect(res.status).toBe(400)
    });
});

describe ("GET /api/auth/userinfo", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it("should return 200 with user data if user is found", async () => {
        await User.create({ email: "test@email.com", password: "123"});

        let user = await User.findOne({email: "test@email.com"});

        const res = await request(app).get("/api/auth/userinfo/").send({user:user});

        expect(res.status).toBe(200);
        //expect(res.user).toBe(user._id);
    })

    it("should return 404 if user does not exist in the database", async () => {
        await User.create({ email: "test@email.com", password: "123"});

        let user = await User.findOne({email: "test@email.com"});
        await User.deleteOne({email: "test@email.com"})

        const res = await request(app).get("/api/auth/userinfo/").send({user:user});

        expect(res.status).toBe(404);
    })
});