const emailLookUp = function(users, useremail) {
  for (let user in users) {
    if (users[user].email === useremail) {
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
  emailLookUp,
  urlsForUser 
 };

 