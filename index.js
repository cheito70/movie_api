//Mongoose code to access mongodb
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//Code that allows to connect to mongodb and myFaveFlixDb
//to perform CRUD operations
mongoose.connect('mongodb://localhost:27017/myFaveFlixDB',
{ useNewUrlParser: true, useUnifiedTopology: true });

const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  fs = require("fs"),
  path = require("path");

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

//GET returning JSON object containing data about top ten movies
app.get("/movies", (req, res) => {
  res.json(movies);
});

//Returns JSON object of a movie by title
app.get ("/movies/:Title", (req, res) => {
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
app.get("/movies/genres/:Genre", (req, res) => {
  Movies.find({ "Genre.Name": req.params.Genre})
  .then((movies) => {
    res.send(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send("Error: " + err);
  })
});

//Get JSON object of movie director by name
app.get("/movies/directors/:Name", (req, res) => {
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
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + "already exists");
    } else {
      Users
      .create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) =>{res.status(201).json(user)
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
app.get("/users", (req, res) => {
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
app.get("/users/:Username", (req, res) => {
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
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
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
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
      $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, //This line ensures updated doc is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    } else {
      res.json(updatedUser);
    }
  });
});



//Delte method for deleting favorite movies
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      title => title !== movieTitle
    );
    res.status(200).send(`${movieTitle} has been removed from user ${id} array`);
  } else {
    res.status(400).send("user does not exist!");
  }
});

//Delete method to delete a user by username
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Usernsme: req.params.Username})
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





//User objects here
let users = [
  {
    id: 1,
    name: "Constance",
    favoriteMovies: ["When Harry Met Sally"]
  },
  {
    id: 2,
    name: "Brian",
    favoriteMovies: []
  },
  {
    id: 3,
    name: "Jennifer",
    favoriteMovies: []
  },
  {
    id: 4,
    name: "Arjuna",
    favoriteMovies: ["Contact"]
  }
];

//Movies array below for the /movies endpoint.

let movies = [
  {
    Title : "Shawshank Redemption",
    Genre : { Name: "Drama" },
    Description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    Director: { Name: "Frank Darabont" },
    ImageURL: "https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg"
  },
  {
    Title : "Close Encounters of the Third Kind",
    Genre : { Name: "Sci-Fi" },
    Description: "Roy Neary, an Indiana electric lineman, finds his quiet and ordinary daily life turned upside down after a close encounter with a UFO, spurring him to an obsessed cross-country quest for answers as a momentous event approaches.",
    Director: { Name: "Steven Spielberg" },
    ImageURL: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/5957/5957508_sa.jpg"
  },
  {
    Title : "Contact",
    Genre : { Name: "Sci-Fi" },
    Description: "Dr. Ellie Arroway, after years of searching, finds conclusive radio proof of extraterrestrial intelligence, sending plans for a mysterious machine.",
    Director: { Name: "Robert Zemeckis" },
    ImageURL: "https://upload.wikimedia.org/wikipedia/en/7/75/Contact_ver2.jpg"
  },
  {
    Title : "Thor",
    Genre : { Name: "Sci-Fi" },
    Description: "The powerful but arrogant god Thor is cast out of Asgard to live amongst humans in Midgard (Earth), where he soon becomes one of their finest defenders.",
    Director: { Name: "Kenneth Branagh" },
    ImageURL: "https://upload.wikimedia.org/wikipedia/en/9/95/Thor_%28film%29_poster.jpg"
  },
  {
    Title : "A River Runs Through It",
    Genre : { Name: "Drama" },
    Description: "Two sons of a stern minister - one reserved, one rebellious - grow up in rural 1920s Montana while devoted to fly fishing.",
    Director: { Name: "Robert Redford" },
    ImageURL: "https://upload.wikimedia.org/wikipedia/en/c/ce/A_river_runs_through_it_cover.jpg"
  },
  {
    Title : "When Harry Met Sally",
    Genre : { Name: "Romantic Comedy" },
    Description: "Harry and Sally have known each other for years, and are very good friends, but they fear sex would ruin the friendship",
    Director: { Name: "Rob Reiner" },
    ImageURL: "https://upload.wikimedia.org/wikipedia/en/1/1c/WhenHarryMetSallyPoster.jpg"
  },
  {
    Title : "Book of Love",
    Genre : { Name: "Romantic Comedy" },
    Description: "Two writers thrown together on a book tour in Mexico.",
    Director: { Name: "Analeine Cal y Mayor" },
    ImageURL: "https://upload.wikimedia.org/wikipedia/en/e/ea/Bookoflove_cover.jpg"
  }
];



//Default textual response
app.get("/", (req, res) => {
  res.send("Welcome to My Fave Flix API!");
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname});
});

//Error handling code
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke! Sorry.....");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port" + port);
});
