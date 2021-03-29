'use strict';

// Load Environment Variables from the .env file
 require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superAgent=require('superagent');
const { response } = require('express');

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
app.get('/park',handelParkRequest);
app.get('/*',notFoundHandler);




function handelLocationRequest(req, response) {
    try{
        let city = req.query.city;
        const url= `https://us1.locationiq.com/v1/search.php?key=${geo_api_key}&q=${city}&format=json`;
       // let locationData = require('./data/location.json');
     
       
      superAgent.get(url).then(res =>{
        let getLocationObject = res.body;
    let locationObject = new Location(city,getLocationObject.display_name,getLocationObject.lat,getLocationObject.lon);
    response.send(locationObject);
      })
    
       } catch(error){
           res.status(500).send('something went wrong ')
       }
}
let  weatherArr=[];
function handelWeatherRequest(req, response) {

    try{
       
        if(weatherArr){
            weatherArr=[];
        }
        // let weatherData = require('./data/ weather.json');
        // let weather = weatherData.data;
        const url= `https://api.weatherbit.io/v2.0/current/airquality?lat=${req.query.data.latitude}&lon=${req.query.data.longitude}&key=${weatherKey}`;

        superAgent.get(url).then(res =>{
            let getWe = res.body;
            weather.map(element =>{
              return  new Weather(getWe.valid_date,getWe.weather.description);

        })
       
        response.send(weatherArr);
        });
        //res.send(weatherArr);
    }
    catch(error){
        response.status(500).send(error)

    }
 }

 function handelParkRequest(req, response) {
     try{
    const url =`https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=${parkApi}`;
     superAgent.get(url).then( res => {  
         const park=res.body.data;
park.map(element =>{
    const name=element.name;
const address=element.address;
const fee=element.fee;
const description=element.description;
    const url=element.url;
     new Park(name,address,fee,description,url)

})
response.send(parkArr);

          })
          res.send(parkArr);
        }
      catch (error){
        response.send(error);
      };

    }
     let parkArr=[]
  
function Park(name,add,fee,des,url){
    this.name=name;
    this.address=add;
    this.fee=fee;
    this.description=des;
    this.url=url;
    parkArr.push(this);



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
function notFoundHandler(request, response) {
  response.status(404).send('plz enter correct ^ _ ^');
}
    
// app.use('*', (req, res) => {
//     res.send('all good nothing to see here!');
// });

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));