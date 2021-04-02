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
const movieApi=process.env.movies_api;
const yelpApi=process.env.yel_api;
const ENV = process.env.ENV || 'DEB';
app.use(cors());

// let client ='';
// if(ENV==='DIV'){
//   client = new pg.Client({connectionString: DATABASE_URL});
// }else{client = new pg.Client({
//     connectionString: DATABASE_URL,
//     ssl: {rejectUnauthorized: false}
//     });}


// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
app.get('/parks', handelParkRequest);
app.get('/movies',getMovie);
app.get('/yelp',getYelp);
app.get('/*',notFoundHandler);

function getMovie(req,response){
  try{

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${movieApi}&query=${req.query.search_query}`;

    superagent.get(url).then( res => {
      const move=res.body.results;
      move.map(element =>{
        const title=element.title;
        const overview=element.overview;
        const vote_average=element.vote_average;
        const vote_count=element.vote_count;
        const image_url='https://image.tmdb.org/t/p/w500'+ element.poster_path;
        const popularity=element.popularity;
        const release_date=element.release_date;
        return new Movies(title,overview,vote_average,vote_count,image_url,popularity,release_date);

      });
      console.log(movieArr);
      response.send(movieArr);

    });

  }
  catch (error){
    response.send(error);
  }


}
let movieArr=[];

function Movies(title,overview,average_votes,total_votes,image_url,popularity,released_on){
  this.title=title;
  this.overview=overview;
  this.average_votes=average_votes;
  this.total_votes=total_votes;
  this.image_url=image_url;
  this.popularity=popularity;
  this.released_on=released_on;
  movieArr.push(this);
}

let count = 0;
function getYelp(request, response){
  //yelpArr=[];
  //let city = request.query.city;
    const url =`https://api.yelp.com/v3/businesses/search?location=${request.query.search_query}&limit=10`;
    superagent.get(url).set('Authorization',`Bearer ${yelpApi}`).then(res => {
        const yelpData = res.body.businesses;
          yelpData.map(element => {
              const name= element.name;
              const img = element.image_url;
              const price= element.price;
              const rating = element.rating;
              const url= element.url;
              return new Yelp(name,img,price,rating,url);
            });

          let count2 =count+5;
         let countArr = yelpArr.slice(count,count2);
         count +=5 ;

            response.send(countArr);
          }).catch((error) => {
            response.status(500).send('something wrong');
          });

        }




let yelpArr = [];
function Yelp(name,image_url,price,rating,url){
    this.name = name;
    this.image_url = image_url;
    this.price = price;
    this.rating =rating;
    this.url =url;
    yelpArr.push(this);
}

function handelParkRequest(req, response) {
  try{

    const url =`https://developer.nps.gov/api/v1/parks?city=${req.query.search_query}&api_key=${parkApi}&limit=10`;

    superagent.get(url).then( res => {
      const park=res.body.data;
      park.map(element =>{
        const name=element.name;
        const addresses=element.addresses;
        const fees=element.fees;
        const description=element.description;
        const url=element.url;
        return new Park(name,addresses,fees,description,url);

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

    if(dataLoction3.rows.length===0){
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
