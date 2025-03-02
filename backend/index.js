const express = require("express");

const app = express();

app.listen(5001, () => {
    console.log("server running on port 5001");
})