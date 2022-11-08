

const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  fs = require("fs"),
  path = require("path"),
  { check, validationResult} = require('express-validator');

const app = express();
const uuid = require("uuid");
const methodOverride = require("method-override");


//Create a write stream in append mode. Also a 'log.txt' file is created in root.

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), { flags: "a"})

app.use(morgan("combined", {stream: accessLogStream})); //sets up logger midware function to terminal

app.use("/documentation.html", express.static("public")); //Automatically routes all requests for static files  to corresponding folder on server

app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true}));

//Mongoose code to access mongodb
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//Code that allows to connect to mongodb and myFaveFlixDb
//to perform CRUD operations
/*mongoose.connect('mongodb://localhost:27017/myFaveFlixDB',
{ useNewUrlParser: true, useUnifiedTopology: true });*/

mongoose.connect( process.env.CONNECTION_URI,
{ useNewUrlParser: true, useUnifiedTopology: true });

//CORS cross-origin resource sharing, limiting access from domains to API
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      //If a specific origin isn't found on list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app); //Connects to auth.js and ensures Express is available in auth.js

//Passport
const passport = require("passport");
require("./passport");


//Default textual response
app.get("/", (req, res) => {
  res.send("Welcome to My Fave Flix API!");
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname});
});

//returns JSON object containing all movies
/*app.get("/movies", (req, res) => {
  Movies.find()
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send("Error: " + err);
  })
});*/

app.get("/movies", function (req, res) {
  Movies.find()
    .then(function (movies) {
      res.status(201).json(movies);
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

//Returns JSON object of a movie by title
app.get ("/movies/:Title", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch ((err) => {
    console.error(err);
    res.status(500).send("Error: " + err)
  })
});

//Returns a JSON object of all movies of a certain genre
app.get("/movies/genres/:Genre", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Genre.Name": req.params.Genre})
  .then((movies) => {
    res.send(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send("Error: " + err);
  })
});

//Returns one description of Genre.
app.get("/genres/:Genre", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Genre})
  .then((movie) => {
    res.send(movie.Genre.Description);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send("Error: " + err);
  })
});

//Get JSON object of movie director by name
app.get("/movies/directors/:Name", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    })
});

//Post method for users creating the "/users" endpoint and creating new users
app.post("/users",
//Validation array using 'check' from 'express-validator' dependency
[
  check('Username', 'Username minimun requirement is 5 characters').isLength({ min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  //evaluate validations
  let errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }


  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })//Search to see if user with requested name already exists
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + " already exists");
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) =>{res.status(201).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      })
    }
  })
  .catch((err) =>{
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Get all Users
app.get("/users", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Get a user by username
app.get("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//User put or update method by username not id
app.put("/users/:Username", passport.authenticate('jwt', { session: false }),
[
  check('Username', 'Username minimun requirement is 5 characters').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - notallowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail(),
],
(req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ Username: req.params.Username},
    { $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }

  },
  { new: true}, //This line makes sure updated doc is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Post method for adding new movie to a user's favoriteMovie list
app.put("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
      $addToSet: { FavoriteMovies: req.params.MovieID } //$addToSet works better than push; won't add duplicates
  },
  { new: true }) // theupdated new doc is returned
  .then ((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});



//Delete favorite movies from user
app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true })  //the updated new doc is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Delete method to delete a user by username
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.");
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

//Delete user by ID
app.delete("/users/:_id", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ _id: req.params._id})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params._id + " was not found");
    } else {
      res.status(200).send(req.params._id + " was deleted.");
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});


//User objects and movie objects were basically transferred to MongoDB


//Error handling code
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke! Sorry.....");
});

const port = process.env.PORT || 14013;
app.listen(port, '0.0.0.0', () => {
  console.log("Listening on Port " + port);
});


//passport.authenticate("jwt", { session: false }),
