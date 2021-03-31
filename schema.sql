DROP TABLE IF EXISTS locations;
CREATE TABLE locations ( 
    id SERIAL PRIMARY KEY, 
    search_query VARCHAR(255), 
    formatted_query VARCHAR(255), 
    latitude NUMERIC(10, 7), 
    longitude NUMERIC(10, 7)
  );

  -- CREATE TABLE weathers ( 
  --   id SERIAL PRIMARY KEY, 
  --   forecast VARCHAR(255), 
  --   time VARCHAR(255), 
   
  -- );
  -- CREATE TABLE parks ( 
  --   id SERIAL PRIMARY KEY, 
  --   name VARCHAR(255), 
  --   address VARCHAR(255), 
  --   fee VARCHAR(255), 
  --   description VARCHAR(255),
  --   url VARCHAR(255)
  -- );