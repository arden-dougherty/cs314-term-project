import request from "supertest";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import Chatroom from "../src/models/chatroom.model";
import Message from "../src/models/message.model";
import { app } from "../src";

// bypass middleware
jest.mock("../src/middleware/auth.middleware", () => ({protectRoute: async (req, res, next) => {
    req.user = req.body.user;
    next();
}}));

describe ("Interaction test: signup and login", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    it ("login should return 200 after calling singup with the same credentials", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        await request(app).post("/api/auth/signup").send({ email: email1, password: password1 });

        const res = await request(app).post("/api/auth/login").send({ email: email1, password: password1 });
        expect(res.status).toBe(200);
    })
});

describe ("Interaction test: signup and create chat room", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
        await Chatroom.deleteMany({});
    });

    it ("create chatroom should return 201 after users signup", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        await request(app).post("/api/auth/signup").send({ email: email1, password: password1 });
        const user1 = await User.findOne({email: email1});

        const email2 = "test@email.com";
        const password2 = "123";
        await request(app).post("/api/auth/signup").send({ email: email2, password: password2 });
        const user2 = await User.findOne({email: email2});

        const res = await request(app).post("/api/chatrooms/create/" + user2._id).send({user:user1});
        expect(res.status).toBe(201);
        const chatroomInDb = await Chatroom.findOne({creatorId: user1._id, memberId: user2._id});
        expect(chatroomInDb).not.toBeNull();
    })
});

describe ("Interaction test: signup, create chat room, and send message", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
        await Chatroom.deleteMany({});
        await Message.deleteMany({});
    });

    it ("send message should return 201 after signing up and creating a chat room", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        await request(app).post("/api/auth/signup").send({ email: email1, password: password1 });
        const user1 = await User.findOne({email: email1});

        const email2 = "test@email.com";
        const password2 = "123";
        await request(app).post("/api/auth/signup").send({ email: email2, password: password2 });
        const user2 = await User.findOne({email: email2});

        await request(app).post("/api/chatrooms/create/" + user2._id).send({user:user1});

        let res = await request(app).post("/api/messages/send/" + user2._id).send({user:user1});
        expect(res.status).toBe(201);
        let message = await Message.findOne({sender: user1._id, recipient: user2._id});
        expect(message).not.toBe(null);

        res = await request(app).post("/api/messages/send/" + user1._id).send({user:user2});
        expect(res.status).toBe(201);
        message = await Message.findOne({sender: user2._id, recipient: user1._id});
        expect(message).not.toBe(null);
    })
});