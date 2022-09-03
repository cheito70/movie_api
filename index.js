const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path');

const app = express();
const uuid = require('uuid');
const methodOverride = require('method-override');


//Create a write stream in append mode. Also a 'log.txt' file is created in root.

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream})); //sets up logger midware function to terminal

app.use("/documentation.html", express.static('public')); //Automatically routes all requests for static files  to corresponding folder on server

app.use(bodyParser.json());
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true}));

//GET returning JSON object containing data about top ten movies
app.get('/movies', (req, res) => {
  res.json(movies);
});

//User objects here
let users = [
  {
    id: 1,
    name: 'Constance',
    favoriteMovies: ['When Harry Met Sally']
  },
  {
    id: 2,
    name: 'Brian',
    favoriteMovies: []
  },
  {
    id: 3,
    name: 'Jennifer',
    favoriteMovies: []
  },
  {
    id: 4,
    name: 'Arjuna',
    favoriteMovies: ['Contact']
  }
];

//Movies array below for the /movies endpoint.

let movies = [
  {
    title : 'Shawshank Redemption',
    genre : { Name: 'Drama' },
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    director: { Name: 'Frank Darabont' },
    imageURL: 'https://upload.wikimedia.org/wikipedia/en/8/81/ShawshankRedemptionMoviePoster.jpg'
  },
  {
    title : 'Close Encounters of the Third Kind',
    genre : { Name: 'Sci-Fi' },
    description: 'Roy Neary, an Indiana electric lineman, finds his quiet and ordinary daily life turned upside down after a close encounter with a UFO, spurring him to an obsessed cross-country quest for answers as a momentous event approaches.',
    director: { Name: 'Steven Spielberg' },
    imageURL: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/5957/5957508_sa.jpg'
  },
  {
    title : 'Contact',
    genre : { Name: 'Sci-Fi' },
    description: 'Dr. Ellie Arroway, after years of searching, finds conclusive radio proof of extraterrestrial intelligence, sending plans for a mysterious machine.',
    director: { Name: 'Robert Zemeckis' },
    imageURL: "https://upload.wikimedia.org/wikipedia/en/7/75/Contact_ver2.jpg"
  },
  {
    title : 'Thor',
    genre : { Name: 'Sci-Fi' },
    description: 'The powerful but arrogant god Thor is cast out of Asgard to live amongst humans in Midgard (Earth), where he soon becomes one of their finest defenders.',
    director: { Name: 'Kenneth Branagh' },
    imageURL: 'https://upload.wikimedia.org/wikipedia/en/9/95/Thor_%28film%29_poster.jpg'
  },
  {
    title : 'A River Runs Through It',
    genre : { Name: 'Drama' },
    description: 'Two sons of a stern minister - one reserved, one rebellious - grow up in rural 1920s Montana while devoted to fly fishing.',
    director: { Name: 'Robert Redford' },
    imageURL: 'https://upload.wikimedia.org/wikipedia/en/c/ce/A_river_runs_through_it_cover.jpg'
  },
  {
    title : 'When Harry Met Sally',
    genre : { Name: 'Romantic Comedy' },
    description: 'Harry and Sally have known each other for years, and are very good friends, but they fear sex would ruin the friendship',
    director: { Name: 'Rob Reiner' },
    imageURL: "https://upload.wikimedia.org/wikipedia/en/1/1c/WhenHarryMetSallyPoster.jpg"
  },
  {
    title : 'Book of Love',
    genre : { Name: 'Romantic Comedy' },
    description: 'Two writers thrown together on a book tour in Mexico.',
    director: { Name: 'Analeine Cal y Mayor' },
    imageURL: "https://upload.wikimedia.org/wikipedia/en/e/ea/Bookoflove_cover.jpg"
  }
];



//Default textual response
app.get('/', (req, res) => {
  res.send('Welcome to My Fave Flix API!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname});
});

//Error handling code
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! Sorry.....')
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
});
