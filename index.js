const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path');

const app = express();


  //methodOverride = require('method-override');


//Create a write stream in append mode. Also a 'log.txt' file is created in root.

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream})); //sets up logger midware function to terminal

app.use(express.static('public')); //Automatically routes all requests for static files  to corresponding folder on server

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//GET returning JSON object containing data about top ten movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    })
});

//Movies array below for the /movies endpoint.

let Movies = [
  {
    title : 'Shawshank Redemption',
    genre : 'Drama'
  },
  {
    title : 'Close Encounters of the Third Kind',
    genre : 'Sci-Fi'
  },
  {
    title : 'Contact',
    genre : 'Sci-Fi'
  },
  {
    title : 'Titanic',
    genre : 'Drama'
  },
  {
    title : 'A River Runs Through It',
    genre : 'Drama'
  },
  {
    title : 'When Harry Met Sally',
    genre : 'Romantic Comedy'
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
