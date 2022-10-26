const express = require("express");
const app = express();
app.use(express.json());

const bcrypt = require("bcrypt");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const initializeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Running at localhost");
    });
  } catch (error) {
    console.log(`error: ${error.message}`);
    process.exit(1);
  }
};

initializeAndStartServer();
module.exports = app;

// api1

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;

  const checkUserQuery = `SELECT * FROM user WHERE username = '${username}';`;

  const dbUser = await db.get(checkUserQuery);

  if (dbUser !== undefined) {
    response.status(400);
    response.send("User already exists"); //done
  } else {
    //create a user
    let encPassword = await bcrypt.hash(request.body.password, 10);
    const addUserSql = `INSERT INTO user (username, name, password, gender, location)
      values( '${username}' , '${name}' , '${encPassword}'  , '${gender}' , '${location}');`;

    const res = await db.get(addUserSql);
    response.send(res);
    response.status(200);

    response.send("User created successfully");
  }
});

// api2 login

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const checkUserExistence = `SELECT * FROM user WHERE username = '${username}';`;

  const dbUser = await db.get(checkUserExistence);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const checkPass = await bcrypt.compare(password, dbUser.password);

    if (checkPass !== true) {
      response.status(400);
      response.send("Invalid password");
    } else {
      response.status(200);
      response.send("Login success!");
    }
  }
});

// change password api3

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const encNewPas = await bcrypt.hash(newPassword, 10);
  const gettingPass = `SELECT * FROM user where username = '${username}';`;
  const dbUser = await db.get(gettingPass);

  if (dbUser !== undefined) {
    const UpdatePas = `update user set username = '${username}' ,
    password = '${encNewPas}'; `;

    await db.run(UpdatePas);
    response.status(200);

    response.send("Password updated"); //done
  }

  //const verifyingPas = await bcrypt.compare(oldPassword, dbUser.password);

  //   if (verifyingPas) {
  //     console.log("");
  //   } else {
  //     response.status(400);
  //     response.send("Invalid current password");
  //   }
});
