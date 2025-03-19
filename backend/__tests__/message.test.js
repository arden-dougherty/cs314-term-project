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

describe ("GET /api/messages/users", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

        it ("should return 200 and list of users", async () => {
            const email1 = "test@email.com";
            const password1 = "123";
            const email2 = "test2@email.com";
            const password2 = "456";
            const email3 = "test3@email.com";
            const password3 = "789";
        
            await User.create({ email: email1, password: password1});
            await User.create({ email: email2, password: password2});
            await User.create({ email: email3, password: password3});
            const user1 = await User.findOne({email: email1});

            const res = await request(app).get("/api/messages/users/").send({user:user1});
            expect(res.status).toBe(200);
            const users = res.body;
            expect(users.length).toBe(2);
        });
});

describe ("POST /api/messages/send/:id", () => {
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

    it ("should return 201 and create a new message if users and chatroom exist", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com";
        const password2 = "456";

        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});

        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        await Chatroom.create({ creatorId: user1._id, memberId:user2._id});

        const res = await request(app).post("/api/messages/send/" + user2._id).send({user:user1});
        expect(res.status).toBe(201);
        const message = await Message.findOne({senderId: user1._id, receiverId: user2._id});
        expect(message).not.toBe(null);
    });

    it ("should return 400 if there is not a chatroom between the two users", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com";
        const password2 = "456";

        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});

        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        const res = await request(app).post("/api/messages/send/" + user2._id).send({user:user1});
        expect(res.status).toBe(400);
        const message = await Message.findOne({senderId: user1._id, receiverId: user2._id});
        expect(message).toBe(null);
    });

    it ("should return 400 if either user does not exist", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com";
        const password2 = "456";

        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});

        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        await User.findByIdAndDelete(user2._id);

        const res = await request(app).post("/api/messages/send/" + user2._id).send({user:user1});
        expect(res.status).toBe(400);
    });
});

describe ("GET /api/messages/:id", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
        await Message.deleteMany({});
    });

    it ("should return 200 and a list of messages if both users exist", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com";
        const password2 = "456";
        const email3 = "test3@email.com";
        const password3 = "789";

        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});
        await User.create({ email: email3, password: password3});

        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});
        const user3 = await User.findOne({email: email3});

        await Message.create({senderId: user1._id, receiverId:user2._id});
        await Message.create({senderId: user2._id, receiverId:user1._id});
        await Message.create({senderId: user2._id, receiverId:user3._id});

        const res = await request(app).get("/api/messages/" + user2._id).send({user:user1});
        expect(res.status).toBe(200);
        const messages = res.body;
        expect(messages.length).toBe(2); 
    })
});