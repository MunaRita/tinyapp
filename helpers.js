const getUserByEmail = function(userEmail, users,) {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return users[user];
    }
  } return null;
};


const urlsForUser = function(urlDatabase, id) {
  const userUrls = {};
  
  for (const key in urlDatabase) {
 
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key].longURL;
    
    }
  }
  return userUrls;
};



// function to generate random words
const generateRandomString = function() {
  let key = Math.random().toString(36).substr(2,6);
  return key;
};



module.exports = {
  getUserByEmail,
  urlsForUser ,
  generateRandomString
};

 