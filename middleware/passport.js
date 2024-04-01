const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const MinistryPlatformAPI = require('ministry-platform-api-wrapper');

const hashPassword = (input) => {
  let hash = CryptoJS.MD5(input);
  let base64 = CryptoJS.enc.Base64.stringify(hash);
  return base64;
}
const compare = (inputPassword, storedPassword) => {
  const hash1 = hashPassword(inputPassword);
  const hash2 = storedPassword;

  const buffer1 = Buffer.from(hash1, 'base64');
  const buffer2 = Buffer.from(hash2, 'base64');
  
  if (buffer1.length !== buffer2.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(buffer1, buffer2);
}
module.exports = function (passport) {
    //Serialization + deserialization for simultaneous logins
    passport.serializeUser(function (user, done) {
        // console.log("Serialize is running");
        done(null, user)
    })

    passport.deserializeUser(function (user, done) {
        // console.log("Deserialize is running");
        MinistryPlatformAPI.request('get', '/tables/dp_Users', {"$filter":`User_GUID='${user.User_GUID}'`}, {})
          .then(([user]) => {
              if (!user) return done(new Error("Unable to find user"));
              done(null, user)
          })
          .catch((error) => {
            done(new Error("Internal server error"))
          });
    })

    passport.use(
        new LocalStrategy({ User_Name: 'User_Name' }, (username, password, done) => {
          MinistryPlatformAPI.request('get', '/tables/dp_Users', {"$filter":`User_Name='${username}'`}, {})
            .then(([user]) => {
              if (!user) return done(new Error("Incorrect username or password"));

              if (compare(password, user.Password)) {
                return done(null, user);
              } else {
                return done(new Error("Incorrect username or password"))
              }
            })
            .catch(() => done(new Error("Internal server error")));
            // MP.findOne({ Email_Address: username })
            //     .then((user) => {
            //         // console.log("User:", user);

            //         if(!user){
            //             return done(null,false,{message: 'User not found'});
            //         }
            //         //match pass
            //         if (MP.compare(password,user.Password)){
            //             return done(null,user);
            //         }else{
            //             return done(null, false, { message: 'password Incorrect'})
            //         }
            //     })
            //     .catch((err) => { done(err) })
        })
    )
}