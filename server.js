/* eslint-disable no-unused-vars */
'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());
//console.log(weather);

// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);



function handelLocationRequest(req, res) {
  try{
    let city = req.query.city;
    let locationData = require('./data/location.json');
    let getLocationObject = locationData[0];
    let locationObject = new Location(city,getLocationObject.display_name,getLocationObject.lat,getLocationObject.lon);

    res.send(locationObject);
  } catch(error){
    res.status(500).send('something went wrong ');
  }
}
let weatherArr=[];
function handelWeatherRequest(req, res) {
  try{

    if(weatherArr){
      weatherArr=[];
    }
    let weatherData = require('./data/ weather.json');
    let weather = weatherData.data;
    weather.forEach(element =>{
      new Weather(element.valid_date,element.weather.description);

    });
    res.send(weatherArr);
  }
  catch(error){
    res.status(500).send('something went wrong ');

  }
}

// constructors

function Location(search_query, formatted_query, latitude, longitude){
  this.search_query= search_query;
  this. formatted_query= formatted_query;
  this.latitude= latitude;
  this.longitude = longitude;
}

function Weather(forecast,time){
  this.forecast=forecast;
  this.time = time;
  weatherArr.push(this);

}

// app.use('*', (req, res) => {
//     res.send('all good nothing to see here!');
// });

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));
