const jwtSecret = 'your_jwt_secret'; //this must be the same key used in JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //Local passport file
