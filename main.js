const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { sendEmailCode } = require("./premioCode.controller.js");
const { verifyPremioCode } = require("./verifier.controller.js");
const app = express();

app.listen(8080, console.log("port 8080"));
//middlewares
app.use(cors());
app.use(express.json());

//verifyies premioCode : boolean
app.post("/verify/:premioCode", verifyPremioCode);
//send email to client with premio code
app.post("/new/", sendEmailCode);
