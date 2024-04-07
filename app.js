
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const pg = require("pg");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require('express-session');
const passport = require("passport");
const passportlocal = require("passport-local");

const app = express();
app.use(express.static("public"));
app.set('view engine','ejs');
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  
}));
app.use(passport.initialize());
app.use(passport.session());


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "assignment",
    password: "sajid123",
    port: 5432,
  });
db.connect();
function User(name, password) {
  this.name = name;
  this.password = password;
}

const users = [];

var user = {
name:""
};
const LocalStrategy = passportlocal.Strategy;
// passport.use("local-register" , new LocalStrategy( async(username, password, done) => {
//   try{
//       const hash_password = await db.query("SELECT * from users WHERE name=$1",[username]);
//       if(hash_password.rowCount == 0){
//         bcrypt.hash(password, saltRounds, async (err, hash) => {
//           if(err){
//             return done(err);
//           }else{
//             await db.query("INSERT INTO users(name,password) VALUES($1,$2);",[username,hash]);
//             user.name=username;
//             return done(null,user);
//           }
//         });
//       }else{
//         return done(null, false);
//       }
//   }catch(err){
//     return done(err);
//   }
// }
// ));
// passport.use("local-login" , new LocalStrategy( async(username, password, done) => {
//   try{
//       const hash_password = await db.query("SELECT * from users WHERE name=$1",[username]);
//       if(hash_password.rowCount == 0){
//         return done(null,false,{message:"name or password is incorrect."});
//       }else{
//         bcrypt.compare(password,hash_password.rows[0].password, (err,result)=>{
//             if(err){
//               return done(err);
//             }
//             else if(result==false){
//               return done(null,false,{message:"User name or password is incorrect."});
//             }else{
//               return done(null, hash_password.rows[0]);
//             }
//         });
//       }
//   }catch(err){
//     return done(err);
//   }
// }
// ));

passport.serializeUser((user, done) => {
  done(null, user.name);
});

passport.deserializeUser( async(name, done) => {
  const result = await db.query("SELECT * FROM users WHERE name=$1",[name]);
  done(null, result.rows[0]);
});


app.get('/', (req, res) => {
  res.render("home");
});


app.get("/submit",(req,res)=>{
  if(req.isAuthenticated()){
    res.send("submit");
  }else{
    res.redirect("login");
  }
});

async function isAdmin(mail,pass){
  return (mail === "John" && pass === "admin_password");
}
app.post("/submit", async (req, res) => {
  const mail = req.body.name;
  const pass = req.body.password;
  const value = req.body.value;
  const decision = req.body.decision;
  if(await isAdmin(mail,pass)){
    res.render("decision.ejs", {decision:decision, value:value}); 
  }else{
    res.render("submit.ejs", {value:value});
  }
     
  
});




// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
