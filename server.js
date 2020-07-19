// requierment
require('dotenv').config(); // to get our enviromental varian=ble from the .env file
// application dependencies ( getting the libraries)
const express = require('express'); 
const cors = require('cors');
const superagent = require('superagent'); // to get data from the api
const pg = require('pg'); // for the db
const methodOverride = require('method-override'); // this method for update and delete


//main variables( application setup)
const app = express(); // to create the server
const client = new pg.Client(process.env.DATABASE_URL); // for db , creating client from pg
const PORT = process.env.PORT || 3000; // choosing the port of server 

//uses
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(cors()); // to make server respond to any request

//listen to port
client.connect()
    .then(() => {  // to connect directly to db
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        })
    })

//====================================================================\\

//==========(routs definitions)=============\\




app.get('/', homepagehandler);
app.get('/add',addHandler);
app.get('/myNews',myNewsHandler)
app.get('/detail/:news_id',detailHandler)
app.put('/update/:update_id',updateHandler)
app.delete('/delete/:delete_id' , deleteHandler)

app.get('*', notFoundHandler);

//=============================call back functions (routs Handlers)=============================\\


//**********homepagehandler*************\\

function homepagehandler (req,res){ // this fi=unction to get data from api and render it on homepage(index)
//key
const key = process.env.NEWS_KEY;
const url = `http://newsapi.org/v2/everything?q=covid19&sortBy=publishedAt&apiKey=${key}`;
superagent.get(url)
.then(data=>{ //any name
    let newsArray = data.body.articles.map(val=>{ // val is parameter from constructor // articles is name of array of jsonsss
      return new News(val);
    });
    res.render('./index', {allData : newsArray}) //allData any name
})
.catch((err) => {
    errorHandler(err, req, res);
  });
}

function News (val){
    this.title = val.title;
    this.auther = val.author;
    this.img_url = val.urlToImage;
    this.description = val.description
}

// add homehandler part in index.ejs ( to prepare it at all and do ejs(rendering) process there and making counter   )


//**********addHandler*************\\

// here we will add ( add  ) button look like the select button before
// when i click it the hidden form will shown which has information about my selection
// we will add too (add news  ) look like the add to database button before
// when i click it we will store selection in db and redirect to /myNews page look like the favourite page before 

function addHandler (req,res){ 
//collect
let {title,auther,img_url,description} = req.query // the names of properties
//insert
let sql = `INSERT INTO test (title,auther,img_url,description) VALUES ($1,$2,$3,$4);`; // test is name of table 
let safeValues = [title,auther,img_url,description];
//redirect
client.query(sql,safeValues)
.then(result=>{
    res.redirect('/myNews')
})

.catch((err) => {
    errorHandler(err, req, res);
  });

}


// add addhandler part in index.ejs & in app.js file 


//**********myNewsHandler*************\\

// to render the information of selected thing from db to /myNews page 


function myNewsHandler (req,res){
    let sql = `SELECT * FROM test;`;
    client.query(sql)
    .then(result=>{
        res.render('./pages/mynews',{myCollection : result.rows})
    })

    .catch((err) => {
        errorHandler(err, req, res);
      });
}

// add myNewshandler part in mynews.ejs








//**********detailHandler*************\\

// adding the show details button in the mynews.ejs page 
// when i click on the button we will redirecting to new page (detail/id for the selected one)
// detail page will have information about seleced thing 

function detailHandler (req,res){
//get params value
let param = req.params.news_id; // news_id from the root 
//select where id = param
let sql = `SELECT * FROM test WHERE id=$1;`;
let safeValues = [param];
client.query(sql,safeValues)
.then(result=>{

    res.render('./pages/details',{data : result.rows[0]})
})

.catch((err) => {
    errorHandler(err, req, res);
  });

}


// add detailhandler part in mynews.ejs ( just one line ) 
// add detailhandler part in details.ejs 






//**********updateHandler*************\\



// adding a form containd information about selected thing 
// adding (update) button 
// when i edit the form then click on the update button > information will updated in the same page 

function updateHandler (req,res){
// get params value
let param = req.params.update_id; //update_id from the root 
// collect the updated data
let  {title,auther,img_url,description} = req.body;
// update the data
let sql = `UPDATE test set title=$1, auther=$2 ,img_url=$3, description=$4 WHERE id=$5;`;
let safeValues = [title,auther,img_url,description,param];
//redirect to the same page
client.query(sql,safeValues)
.then(result=>{
    res.redirect(`/detail/${param}`)
})

.catch((err) => {
    errorHandler(err, req, res);
  });

}

// add updatehandler part in details.ejs 







//**********deleteHandler*************\\


// we will add (delete ) button in the detail/id for the thing  page 
// when i click on it > the selected thing will removed from the collection
// then it will redirect me to the /myNews page 

function deleteHandler (req,res){

    // get param value
    let param = req.params.delete_id; // delete_id from the root 
    // delete from database
    let sql = `DELETE FROM test WHERE id=$1;`;
    let safeValues = [param]
    //redirect to my list news
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/myNews')
    })
    
    .catch((err) => {
        errorHandler(err, req, res);
      });

}


// add the deletehandler part in details.ejs 







//====================================================================\\
//error handlers

function notFoundHandler (req,res){
    res.status(404).send('page not found') ; // or the message "This route does not exist!!"
 }

 function errorHandler (err,req,res){
     res.status(500).send(err);
 }
 