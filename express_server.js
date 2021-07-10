const express = require("express");
const cookieSession = require('cookie-session');
const { getUserByEmail,  urlsForUser, generateRandomString } = require('./helpers');
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
app.use(bodyParser.urlencoded({extended: true}));


// Initialze Database
const users = {};
const urlDatabase = {};


// Main Route => Homepage
app.get("/urls", (req, res) => {
  const id = req.session["user_id"];
  const templateVars = {
    urls:  urlsForUser(urlDatabase, id),
    users: users,
    registeredUser: users[id]
    
  };
  
  res.render("urls_index", templateVars);
});


// Request a new url form
app.get("/urls/new", (req, res) => {
  const currentUser = req.session["user_id"];

  const templateVars = {
    registeredUser: currentUser 
    
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


// Redirect any request to "/u/:shortURL" to its longURL
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
  const urlOwner = urlDatabase[shortURL].userID;

  //console.log(req.params.shortURL);
console.log("userID:", userID);
console.log("urlOwner:", urlOwner);
  if (userID === urlOwner) {

    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      registeredUser: userID,
      urls:  urlsForUser(urlDatabase, userID)
      
    };
    
    res.render("urls_show", templateVars);
    

  } else {
    res.status(403).send("Url does not belong to you!");
  }
  
});


// Update the longURL of the shortURL when user is logged in and associate the urls with the user
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const urlOwner = urlDatabase[shortURL].userID;
  const userID = req.session["user_id"];
  

  if (urlOwner === userID) {
    
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userID
    };

    res.redirect('/urls');

   }// else  { ==== don't think this is relevant
  //   res.status(403).send("You cannot update a url that is not created by you!");
  // }

});


// Delete action can only be done by the urlOwner
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];
  const urlOwner = urlDatabase[shortURL].userID;

  if (urlOwner === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");

  } else {
    res.status(403).send("You can't delete a url that doesn't belong to you!");
  }

  
});


// GET the login page
app.get("/login", (req, res) => {
  const id = req.session["user_id"];

  const templateVars = {
    registeredUser: users[id]
  };
  
  res.render("login", templateVars);
});



// log in the user and return to homepage or return relevant error message
app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const emailExist = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  if (password.length === 0 || email.length === 0) {
    return res.status(403).send("invalid email or password");

  } else if (!emailExist)  {
    return res.status(403).send("<h3>email does not exist!</h3><a href='/register'>Try Registering!</a>");

  } else if (!emailExist || !bcrypt.compareSync(emailExist.password, hashedPassword))  {
    return res.status(403).send("wrong password!");

  }
  const userID = emailExist.id;
  
  req.session["user_id"] = userID;
  
  res.redirect("/urls");

});


//logout and redirect to homepage
app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});


// Register: renders the registration form
app.get("/register", (req, res) => {
const currentUserId = req.session["user_id"];
  
  const templateVars = {
  registeredUser: currentUserId 
  };
 
  res.render("register",templateVars);
});


// Generate a unique ID for new user after registering; Secure user information; redirect to homepage
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);
  const emailExist = getUserByEmail(email, users);

  if (emailExist) {
    return res.status(400).send("<h3>email already exist!</h3><a href='/login'>Try logging in!</a>");
  }

  if (!emailExist) {
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
  }

  req.session["user_id"] = userID;
 
  res.redirect("/urls");
 
});

// Get request for the url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Get request request sample
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





