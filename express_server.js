const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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


app.get('/urls/:shortURL', function (req, res) {
  const shortURL = req.params.shortURL;
  //console.log(urlDatabase[shortURL]);
  const templateVars = {shortURL: shortURL, longURL: urlDatabase[shortURL] }
  // console.log(req.params);
  //console.log(urlDatabase);
  //res.send(req.params);
  res.render("urls_show", templateVars);
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