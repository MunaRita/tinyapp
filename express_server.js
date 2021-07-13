const express = require("express");
const cookieSession = require('cookie-session');
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString
} = require('./helpers');
const bcrypt = require('bcrypt');

// Server configuration
const salt = bcrypt.genSaltSync(10);
const app = express();
const PORT = 8080;
app.use(cookieSession({
  name: "session",
  keys: ["secretsecretIgotAsecret", "SuiteMadameBlue"]
}));
app.set("view engine", "ejs");

// middleware to make the data readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

// Initialze Database
const users = {};
const urlDatabase = {};

// Main page
app.get("/", (req, res) => {
  const id = req.session["user_id"];
  const url = urlsForUser(urlDatabase, id);
  if (!id) {
    const templateVars = {
      urls: null,
      user: null,
    };
    res.render("pleaselogin", templateVars);
  }
  res.redirect('/urls');
});

// Url page
app.get("/urls", (req, res) => {
  const id = req.session["user_id"];
  const url = urlsForUser(urlDatabase, id);
  if (!id) {
    const templateVars = {
      urls: null,
      user: null,
    };
    res.render("pleaselogin", templateVars);

  } else {
    const templateVars = {
      urls: url,
      user: users[id]
    };
    res.render("urls_index", templateVars);
  }
});

// Request a new url form
app.get("/urls/new", (req, res) => {
  const currentUser = req.session["user_id"];

  const templateVars = {
    user: currentUser
  };
  res.render("urls_new", templateVars);
});

//  Add new url to database, can only be done by a registered user with unique id
app.post("/urls", (req, res) => {
  const currentUser = req.session["user_id"];

  if (currentUser) {
    const shortURl = generateRandomString();

    urlDatabase[shortURl] = {
      longURL: req.body.longURL,
      userID: currentUser
    };
    res.redirect(`/urls/${shortURl}`);

  } else {
    res.send("<h3>You must be logged in!</h3><a href='/login'>Try logging in!</a>");
  }
});

// Redirect any request of shortURL to its longURL if the URL exist
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  if (!longURL) {
    res.send("Sorry does not exist!");

  } else {
    res.redirect(longURL);
  }
});

// Edit page, user can only edit urls created by user
app.get('/urls/:shortURL', function(req, res) {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];

  if (!userID) {
    res.status(403).send("You must be logged in!\n");
    return;
  }

  if (!urlDatabase[shortURL]) {
    res.status(403).send("url does not exist");
    return;
  }

  const url = urlsForUser(urlDatabase, userID);
  const urlOwner = urlDatabase[shortURL].userID;

  if (urlOwner === userID) {

    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[userID],
      urls: url
    };

    res.render("urls_show", templateVars);

  } else {
    res.status(403).send("You cannot edit a url that is not created by you!");
  }
});

// Update the longURL of the shortURL when user is logged in and associate the urls with the user
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];

  if (!userID) {
    res.status(403).send("You must be logged in!\n");
    return;
  }
  if (!urlDatabase[shortURL]) {
    res.status(403).send("url does not exist");
    return;
  }

  const urlOwner = urlDatabase[shortURL].userID;

  if (urlOwner === userID) {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID
    };
    res.redirect('/urls');

  } else {
    res.status(403).send("You cannot access a url that is not created by you!");
  }
});

// Delete action can only be done by the urlOwner
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];
  if (!userID) {
    res.status(403).send("You must be logged in!\n");
    return;
  }
  if (!urlDatabase[shortURL]) {
    res.status(403).send("url does not exist");
    return;
  }

  const urlOwner = urlDatabase[shortURL].userID;
  if (urlOwner === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");

  } else {
    res.status(403).send("You can't delete a url that doesn't belong to you!");
  }
});

// login page
app.get("/login", (req, res) => {
  const id = req.session["user_id"];
  if (id) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
});

// log in the user and return to urls page or return relevant error message
app.post("/login", (req, res) => {

  // Extract relevant data
  const email = req.body.email;
  const password = req.body.password;

  // check data against "database"
  if (password.length === 0 || email.length === 0) {
    return res.status(403).send("invalid email or password");
  }

  const user = getUserByEmail(email, users);
 
  if (!user) {
    return res.status(403).send("<h3>email is not associated to any account!</h3><a href='/register'> Please Register!</a>");
  }
  
  const passwordMatch = bcrypt.compareSync(password, user.password);

  // if data matches, create a cookie and redirect to urls page
  if (user && passwordMatch) {
    const userID = user.id;
    req.session["user_id"] = userID;
    res.redirect("/urls");

  } else if (user && !passwordMatch) {
    return res.status(403).send("wrong password!");
  }
});

//logout and redirect to urls page
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

// Register: renders the registration form
app.get("/register", (req, res) => {
  const currentUserId = req.session["user_id"];
  const templateVars = {
    user: currentUserId
  };
  res.render("register", templateVars);
});

// Generate a unique ID for new user after registering; Secure user information; redirect to urls
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);
  const user = getUserByEmail(email, users);

  if (user) {
    return res.status(400).send("<h3>email already exist!</h3><a href='/login'>Try logging in!</a>");
  }

  if (!user) {
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
  }
  req.session["user_id"] = userID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});