# promo-obras
This repo contains the code for a full stack MEAN app to manage Property developers (promotores) and the properties under their ownership:
- The `server` folder stores the back-end app (a RESTful API using Node, Express and Mongo). It shows how to use Node with Express to provide a RESTful API app which persist data into a MongoDB database.
- The `client` folder stores the front-end app (using Angular1 and Bootstrap3). This AngularJS app will consume those resources exposed by the back-end RESTful API.  

## Important Note
Take into account that:
- this application has been developed ONLY for my own personal training purposes so it is NOT fit for use in a production environment.

- I am telling Express to expose the `client` folder as a static path: this way you can run the AngularJS client code on the same Express server (and cross-origin won't be required if you follow this)


## Requirements
- [Node and npm](https://nodejs.org)
- [Local MongoDB Database](https://www.mongodb.com/download-center#community)

I have only tested MongoDB on Windows platforms. If that is your OS then follow these steps:

1) Set up the MongoDB environment. MongoDB requires a data directory to store all data so you have to create the folder `\data\db` on the drive from which you start MongoDB.

2) Start MongoDB manually. To start the main MongoDB process run `mongod` using a terminal (`mongod` is usually located in the folder "C:\Program Files\MongoDB\Server\3.x\bin")

Note: In this link you can check the instructions to setup and run MongoDB for other OS: `https://docs.mongodb.com/manual/installation/#tutorials)`


## Installation and Running the App
Download or clone the repo.

Make sure MongoDB is running.

Make sure nodemon is installed globally:

```bash
npm install -g nodemon
```

Navigate inside the `server` folder to install the necessary dependencies for the app to work:

```bash
npm install
```


Start the server:
```bash
nodemon appback
```

Both apps will be served at localhost:3000.

## About the app
After starting the app you will be sent to the 'home' page. 

In that 'home' page you must create an user account if you still don't have one. 

With that user account you will be able to 'login' in the app (that creates a session in the back-end) and make use of most of the functionalities provided by the back-end app.

The list of users in the app, their deletion or edition can only be done using an 'admin' account.

