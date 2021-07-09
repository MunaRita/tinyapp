const getUserByEmail = function(userEmail, users, ) {
  for (let user in users) {
    if (users[user].email === userEmail) {
      return users[user];
    } 
} return null;
};


const urlsForUser = function(databaseofURL, id) {
  const urlsObj = {};
  
 for (const key in databaseofURL) {
 
  if(databaseofURL[key].userID === id) {
    urlsObj[key] = databaseofURL[key].longURL;
    
  }
}
return urlsObj;
};



module.exports = { 
  getUserByEmail,
  urlsForUser 
 };

 