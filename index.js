const express = require('express');
  morgan = require('morgan');

const app = express();

//Create a write stream in append mode. Also a 'log.txt' file is created in root.

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a'})

app.use(morgan('combined')); //sets up logger midware function to terminal

app.use(express.static('public')); //Automatically routes all requests for static files  to corresponding folder on server


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

app.get('/', (req, res) => {
  res.send('Welcome to My Fave Flix API!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname});
});
