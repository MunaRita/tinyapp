const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// middleware to make the data readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// function to generate random words
function generateRandomString() {
  let key = Math.random().toString(36).substr(2,6);
  return key;
}

app.set("view engine", "ejs");  // tells the Express app to use EJS as its templating engine. 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
//});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Request a new url form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");    // server finds the url_new template, generates the html and sends it back to the browser
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console

  // Server generate a new shortURL and saves it to the urlDatabase.
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  console.log(urlDatabase);

  // Redirect After Form Submission
  res.redirect(`/urls/${key}`);

  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

/* Server looks up the longURL from the urlDatabase, passes the short and long URLs to the template,
 generates the html then sends the html back to the browser*/
app.get('/urls/:shortURL', function (req, res) {
  const shortURL = req.params.shortURL;
  //console.log(urlDatabase[shortURL]);
  const templateVars = {shortURL: shortURL, longURL: urlDatabase[shortURL] }
  // console.log(req.params);
  //console.log(urlDatabase);
  //res.send(req.params);
  res.render("urls_show", templateVars); // bowserr renders the html received from the server
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// Will a variable that is created in one request be accessible in another?
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});