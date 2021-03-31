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
    const url =`https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=${parkApi}`;
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
   // response.send(parkArr);
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
  try{
    let city = req.query.city;
    const url= `https://us1.locationiq.com/v1/search.php?key=${geo_api_key}&q=${city}&format=json`;



    superagent.get(url).then(res =>{
      let getLocationObject = res.body[0];

      let locationObject = new Locations(city,getLocationObject.display_name,getLocationObject.lat,getLocationObject.lon);

    response.send(locationObject);
    });

  } catch(error){
    console.log(error);
    response.status(500).send('something went wrong ');

  }
}



function Locations(search_query, formatted_query, latitude, longitude){
  this.search_query= search_query;
  this. formatted_query= formatted_query;
  this.latitude= latitude;
  this.longitude = longitude;
}














let weatherArr=[];
function handelWeatherRequest(request, response) {
  console.log('inside function weather');

  try{
    console.log('insi try');


    const url=`https://api.weatherbit.io/v2.0/forecast/daily?lat=${request.query.latitude}&lon=${request.query.longitude}&key=${weatherKey}`;
// console.log(request.query.latitude);
// console.log(url);
    superagent.get(url).then(res =>{
      // console.log('----------------res.body');
      // console.log(res.body);
       res.body.data.map(element=>{
         console.log('eeeeeeee'+element);
          return new Weather(element.valid_date,element.weather.description);
      });

      response.send(weatherArr);
    });
  //   console.log('before req');
   // console.log(weatherArr);
  //response.send(weatherArr);
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
