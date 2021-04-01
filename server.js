/* eslint-disable indent */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent=require('superagent');
const { response, request } = require('express');
const pg=require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

// Application Setup
const PORT = process.env.PORT;
const app = express();
const geo_api_key=process.env.apiKey;
const weatherKey=process.env.weather_apiKey;
const parkApi=process.env.parkApi;
app.use(cors());
//console.log(weather);

// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
app.get('/parks', handelParkRequest);
app.get('/*',notFoundHandler);


function handelParkRequest(req, response) {
  try{

    const url =`https://developer.nps.gov/api/v1/parks?city=${req.query.search_query}&api_key=${parkApi}&limit=10`;
    superagent.get(url).then( res => {
      const park=res.body.data;
      park.map(element =>{
        const name=element.name;
        const address=element.address;
        const fee=element.fee;
        const description=element.description;
        const url=element.url;
        return new Park(name,address,fee,description,url);

      });
      response.send(parkArr);

    });

  }
  catch (error){
    response.send(error);
  }

}
let parkArr=[];

function Park(name,add,fee,des,url){
  this.name=name;
  this.address=add;
  this.fee=fee;
  this.description=des;
  this.url=url;
  parkArr.push(this);



}



function handelLocationRequest(req, response) {

  let city=req.query.city;

  const selectQuery ='SELECT * FROM locations WHERE search_query=$1;';

  client.query(selectQuery, [city]).then((dataLoction3)=>{

    if(dataLoction3){
      const url=`https://us1.locationiq.com/v1/search.php?key=${geo_api_key}&q=${city}&format=json`;
      superagent.get(url).then(res => {
        let dataLoction = res.body[0];


        let theLocation = new Locations(city, dataLoction.display_name,dataLoction.lat,dataLoction.lon);
        const insert ='INSERT INTO locations(search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);';
        const safeValues= [theLocation.search_query,theLocation.formatted_query ,theLocation.latitude,theLocation.longitude];
        client.query(insert,safeValues )
        .then((dataLoction2) => {
          response.send(theLocation);

        });
      });

    } else {
      response.send(dataLoction3.rows[0]);
    }
  });

}





function Locations(search_query, formatted_query, latitude, longitude){
  this.search_query= search_query;
  this. formatted_query= formatted_query;
  this.latitude= latitude;
  this.longitude = longitude;
}
let weatherArr=[];
function handelWeatherRequest(request, response) {


  try{

    const url=`https://api.weatherbit.io/v2.0/forecast/daily?lat=${request.query.latitude}&lon=${request.query.longitude}&key=${weatherKey}&days=8`;

    superagent.get(url).then(res =>{
       res.body.data.map(element=>{
          return new Weather(element.valid_date,element.weather.description);
      });

      response.send(weatherArr);
    });
    console.log(weatherArr);
  }
  catch(error){
    console.log(error);
    response.status(500).send(error);
  }

}
  function Weather(forecast,time){
    this.forecast=forecast;
    this.time = time;
    weatherArr.push(this);

  }
function notFoundHandler(request, response) {
  response.status(404).send('plz enter correct ^ _ ^');
}
client.connect().then(() => {
  app.listen(PORT, () => {
     console.log('Connected to database:', client.connectionParameters.database); //show what database we connected to
    console.log('Server up on', PORT);
  });
});
