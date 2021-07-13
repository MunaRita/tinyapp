const getUserByEmail = function(userEmail, users) {
  for (const user in users) {
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

const generateRandomString = function() {
  const key = Math.random().toString(36).substr(2,6);
  return key;
};

module.exports = {
  getUserByEmail,
  urlsForUser ,
  generateRandomString
};

 