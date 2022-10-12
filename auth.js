const jwtSecret = 'your_jwt_secret'; //this must be the same key used in JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //Local passport file


let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username encoded in the JWT(token)
    expiresIn: '7d', //Expiry time of token
    algorithm: 'HS256' //Algo used to "sign" or encode values of JWT
  });
}

/* Post login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
