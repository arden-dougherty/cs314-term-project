import request from "supertest";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import Chatroom from "../src/models/chatroom.model";
import { app } from "../src";

// bypass middleware
jest.mock("../src/middleware/auth.middleware", () => ({protectRoute: async (req, res, next) => {
    req.user = req.body.user;
    next();
}}));

describe ("POST /api/chatrooms/create/:id", () => {
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

    it ("should create a chatroom and return 201 if both users exist", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com"
        const password2 = "456";
        
        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});

        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        const res = await request(app).post("/api/chatrooms/create/" + user2._id).send({user:user1});

        expect(res.status).toBe(201);
        const chatroomInDb = await Chatroom.findOne({creatorId: user1._id, memberId: user2._id});
        expect(chatroomInDb).not.toBeNull();
    });

    it ("should return 400 if a chatoom already exists with the same users", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com"
        const password2 = "456";
        
        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});
        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        await Chatroom.create({ creatorId: user1._id, memberId:user2._id});

        let res = await request(app).post("/api/chatrooms/create/" + user2._id).send({user:user1});
        expect(res.status).toBe(400);

        res = await request(app).post("/api/chatrooms/create/" + user1._id).send({user:user2});
        expect(res.status).toBe(400);
    });

    it ("should return 404 if either user is invalid", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com"
        const password2 = "456";
        
        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});
        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        await User.findOneAndDelete({email: email2});

        let res = await request(app).post("/api/chatrooms/create/" + user1._id).send({user:user2});
        expect(res.status).toBe(404);

        res = await request(app).post("/api/chatrooms/create/" + user2._id).send({user:user1});
        expect(res.status).toBe(404);

        await User.findOneAndDelete({email: email1});
        res = await request(app).post("/api/chatrooms/create/" + user1._id).send({user:user1});
        expect(res.status).toBe(404);
    });
});

describe ("DELETE /api/chatrooms/delete/:id", () => {
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

    it ("should return 200 and remove the chatroom if a chatroom with these users exists", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com";
        const password2 = "456";
        
        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});
        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        await Chatroom.create({ creatorId: user1._id, memberId:user2._id});

        let res = await request(app).delete("/api/chatrooms/delete/" + user2._id).send({user:user1});
        expect(res.status).toBe(200);
        let chatroom = Chatroom.findOne({ creatorId: user1._id, memberId:user2._id});
        expect(chatroom).toBeNull;

        await Chatroom.create({ creatorId: user1._id, memberId:user2._id});
        res = await request(app).delete("/api/chatrooms/delete/" + user1._id).send({user:user2});
        expect(res.status).toBe(200);
        chatroom = Chatroom.findOne({ creatorId: user1._id, memberId:user2._id});
        expect(chatroom).toBeNull;
    });

    it ("should return 400 if chatroom does not exist", async () => {
        const email1 = "test@email.com";
        const password1 = "123";
        const email2 = "test2@email.com";
        const password2 = "456";
        
        await User.create({ email: email1, password: password1});
        await User.create({ email: email2, password: password2});
        const user1 = await User.findOne({email: email1});
        const user2 = await User.findOne({email: email2});

        let res = await request(app).delete("/api/chatrooms/delete/" + user2._id).send({user:user1});
        expect(res.status).toBe(400);
        res = await request(app).delete("/api/chatrooms/delete/" + user1._id).send({user:user2});
        expect(res.status).toBe(400);
    })
});

describe ("GET /api/chatrooms/list", () => {
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

        it ("should return 200 and list of chatrooms if user id is valid", async () => {
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

            await Chatroom.create({ creatorId: user1._id, memberId:user2._id});
            await Chatroom.create({ creatorId: user3._id, memberId:user1._id});
            await Chatroom.create({ creatorId: user3._id, memberId:user2._id});

            const res = await request(app).get("/api/chatrooms/list/").send({user:user1});
            expect(res.status).toBe(200);
            const chatrooms = res.body;
            expect(chatrooms.length).toBe(2);
        });
});