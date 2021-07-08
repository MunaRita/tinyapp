const emailLookUp = function(users, useremail) {
  for (let user in users) {
    if (users[user].email === useremail) {
      return users[user];
    } 
} return null;
};

module.exports = { emailLookUp };