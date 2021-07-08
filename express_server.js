const express = require("express");
const  cookieParser = require('cookie-parser');
const { emailLookUp,  urlsForUser } = require('./helpers');
const app = express();
app.use(cookieParser());

const PORT = 8080; // default port 8080

// middleware to make the data readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// function to generate random words
function generateRandomString() {
  let key = Math.random().toString(36).substr(2,6);
  return key;
};
 
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


app.set("view engine", "ejs");  // tells the Express app to use EJS as its templating engine.

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "AJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "Aj48lW"
  }
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
//});


app.get("/urls", (req, res) => {
  //const templateVars = { urls: urlDatabase };
  const currentUser = req.cookies["user_id"];
  if(!currentUser) {
    return res.status(401).send("log in or register!");
  }
 
  //console.log(currentUser);
  //templateVars.user = currentUser;
  const templateVars = {
    urls:  urlsForUser(urlDatabase, currentUser),
    users: users,
    registeredUser: users[currentUser]
    
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// Request a new url form
app.get("/urls/new", (req, res) => {
  const currentUser = req.cookies["user_id"];
  //const email = req.body.email;
  //console.log(currentUser);
  const templateVars = {
    urls: urlDatabase,
    registeredUser: users[currentUser],
    users: users,
    //email: email
  };
  res.render("urls_new", templateVars);    // server finds the url_new template, generates the html and sends it back to the browser
});

app.post("urls/new", (req, res) => {

  res.redirect("urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
const currentUser = req.cookies["user_id"];
if(currentUser) {
  // Server generate a new shortURL and saves it to the urlDatabase.
  let key = generateRandomString();
  urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: currentUser
  };
  // urlDatabase[key] = {
    
  //   longURL: req.body.longURL,
  //   shortURL: key
  // };
  console.log("urlDatabase:", urlDatabase);
  

  // Redirect After Form Submission
  //res.redirect("/urls");
  res.redirect(`/urls/${key}`);
  
} else {
  res.send("<h3>You must be logged in!</h3><a href='/login'>Try logging in!</a>");
}


  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    //res.sendStatus();
    res.send("Sorry does not exist");
    
  } else {
    //console.log("longURL:", longURL);
    res.redirect(longURL);
  }
  
});


/* Server looks up the longURL from the urlDatabase, passes the short and long URLs to the template,
 generates the html then sends the html back to the browser*/
app.get('/urls/:shortURL', function(req, res) {
  const shortURL = req.params.shortURL;
  
 
  //console.log(urlDatabase[shortURL]);
  //const templateVars = {shortURL: shortURL, longURL: urlDatabase[shortURL] };
  // console.log(req.params);
  //console.log(urlDatabase);
  //res.send(req.params);

  const currentUser = req.cookies["user_id"];
  //const email = req.body.email;
  const templateVars = {
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    //urls: urlDatabase,
    registeredUser: users[currentUser],
    users:users,
    //email:email
  };

  res.render("urls_show", templateVars); // browser renders the html received from the server
});

app.post('/urls/:shortURL', (req, res) => {
  // console.log("this is param", req.params.shortURL);
  // console.log("this is body", req.body);
  const currentUser = req.cookies["user_id"];

  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: currentUser
  };

  res.redirect('/urls');
});


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  console.log(key);
  delete urlDatabase[key];

  res.redirect("/urls");
});


// Will a variable that is created in one request be accessible in another?
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });


//GET /login endpoint that responds with the new login form template
app.get("/login", (req, res) => {
   const currentUser = req.cookies["user_id"];
  // const email = req.body.email;
  // const password = req.body.password;
  
  const templateVars = {
    registeredUser: users[currentUser]
    // email: email,
    // password: password
    //users:users
    
  };
  //console.log(currentUser);
  //console.log("register");
  res.render("login", templateVars);
});

// login
app.post("/login", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const emailExist = emailLookUp(users, email);
  
if(password.length === 0 || email.length === 0) {
  return res.status(403).send("invalid email or password");

} else if (!emailExist)  {
  return res.status(403).send("email does not exist!");

} else if (emailExist && password !== emailExist.password)  {
  return res.status(403).send("wrong password!");

} 

  res.cookie('user_id', userID);
  //const email = req.body.email;
  res.redirect("/urls");

});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const currentUser = req.cookies["user_id"];
  const email = req.body.email;
  const password = req.body.password;
  
  const templateVars = {
    registeredUser: users[currentUser],
    email: email,
    password: password
    //users:users,
    
  };
  //console.log(currentUser);
  //console.log("register");
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  
  const email = req.body.email;
  const password = req.body.password;
  const emailExist = emailLookUp(users, email);

if (!email ||!password) {
  return res.status(400).send("Wrong password or email!");
}
 if (emailExist) {
  return res.status(400).send("<h3>email already exist!</h3><a href='/login'>Try logging in!</a>");
 }

 if(!emailExist) {
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
 }
  res.cookie('user_id', userID);
  res.redirect("/urls");
  //console.log("users:", users);
  //req.cookies("username")
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





