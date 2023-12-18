require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const db = require("./db");
const cors=require("cors");
const http = require('http');
const bodyParser = require('body-parser');
var path=require('path');
const crypto = require('crypto');
const { log } = require('util');

const app=express();
app.use(cors());
const port = process.env.PORT || 3001;
app.use(express.json());

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.static('public'));
//app.use('/assets', express.static(path.join(__dirname, 'assets/images')));

 app.get('/', function(req,res){
	res.sendFile(path.join(__dirname,'index.html'));
  });

  app.get('/Ration_Card_Auth', function(req,res){
	res.sendFile(path.join(__dirname,'Ration_Card_Auth.html'));
  });

  app.get('/dispatch', function(req,res){
	res.sendFile(path.join(__dirname,'dispatch.html'));
  });

  app.get('/language_selection', function(req,res){
	res.sendFile(path.join(__dirname,'language_selection.html'));
  });

  app.get('/grains_details', function(req,res){
	res.sendFile(path.join(__dirname,'grains_details.html'));
  });

  app.get('/addquantity', function(req,res){
	res.sendFile(path.join(__dirname,'addquantity.html'));
  });



app.get('/family_details', (req, res) => {
    res.sendFile(__dirname + '/family_details.html');
   
});


app.get('/price_calculation', (req, res) => {
    res.sendFile(__dirname + '/price_calculation.html');
   
});

app.get('/paymentpage', (req, res) => {
    res.sendFile(__dirname + '/paymentpage.html');
   
});

app.get('/transaction_success', (req, res) => {
    res.sendFile(__dirname + '/Transcation_successful.html');
   
});



app.get('/header', (req, res) => {
    res.sendFile(__dirname + '/header.html');
   
});

app.get('/assets/images/Annadata_logo.png', (req, res) => {
    res.sendFile(__dirname + '/assets/images/Annadata_logo.png');
   
});

app.get('/assets/images/azadi_logo.png', (req, res) => {
    res.sendFile(__dirname + '/assets/images/azadi_logo.png');
   
});


app.get('/assets/images/digitalindia_logo.png', (req, res) => {
    res.sendFile(__dirname + '/assets/images/digitalindia_logo.png');
   
});


app.get('/assets/images/cdac_logo.png', (req, res) => {
    res.sendFile(__dirname + '/assets/images/cdac_logo.png');
   
});


app.get('/footer', (req, res) => {
    res.sendFile(__dirname + '/footer.html');
   
});




app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/test.html');
   
});

app.get('/errorpage', (req, res) => {
    res.sendFile(__dirname + '/errorpage.html');
   
});




app.get("/getRationdet",async (req,res)=>{

        const result = await db.query("select * from ration_card");
       res.json(result.rows);
});

app.get("/price",async (req,res)=>{

    const result = await db.query("select price from commodity");
   res.json(result.rows);
});

app.get("/checktransaction/:id",async (req,res)=>{

    const id=(req.params.id);
    const result = await db.query(`select * from transaction where ration_card_id=${id}`);
   res.json(result.rows);
});
app.get("/countfamily/:id",async (req,res)=>{

    const id=(req.params.id);
    const result = await db.query(`SELECT COUNT(*) AS famcount
   from beneficiary
     where ration_card_id=${id}`);
   res.json(result.rows);
});



app.get("/checktransactionquantity/:id",async (req,res)=>{

    const id=(req.params.id);
    const result = await db.query(`SELECT c.*,r.*, SUM(t.quantity) AS total_quantity
    FROM ration_card r
    INNER JOIN transaction t ON r.ration_card_id = t.ration_card_id
    INNER JOIN commodity c ON c.commodity_id = t.commodity_id
    WHERE r.ration_card_id = '${id}'
    GROUP BY c.commodity_id,r.ration_card_id
    `);
   res.json(result.rows);
});




app.get("/getRationdet/:id",async (req,res)=>{
    const id=(req.params.id);
    try{
   const result = await db.query(`select * from ration_card r, beneficiary b where r.ration_card_id=b.ration_card_id and b.ration_card_id=${id}`);
   res.json(result.rows);
   // console.log(result.rows);
    }catch(err){console.log(err.message)}
    });

app.get("/getRationdet/checkgrainsdetail/:id",async (req,res)=>{
    const id=(req.params.id);
    try{
       const result = await db.query(`select * from ration_card r, transaction t where r.ration_card_id=t.ration_card_id and t.ration_card_id=${id}`);
       res.json(result.rows);
       // console.log(result.rows);
    }catch(err){console.log(err.message)}
});

app.get("/getRationdet/getgrainsdetails/:id",async (req,res)=>{
    const id=(req.params.id);
    try{
       const result = await db.query(`select Distinct r.*,c.* from ration_card r, commodity c ,beneficiary b where r.ration_card_id=b.ration_card_id and  r.ration_card_id=${id}`);
       res.json(result.rows);
       // console.log(result.rows);
    }catch(err){console.log(err.message)}
});
    
app.post("/authenticationdata/:id",async(req,res)=>{
  
    const id=(req.params.id);

    try{
        const logId = crypto.randomInt(10000000000, 99999999999);
       
        const currentDate = new Date().toISOString().split('T')[0];
        const result = await db.query(
            'INSERT INTO authentication_log(log_id, ration_card_id, fps_id, auth_date, auth_method) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [logId, id, 'FPS001', currentDate, 'Card']
          );
          res.status(200).json({ success: true, message: 'Authentication data received successfully.',logId});
    }catch(error){
        res.status(400).json({ success: false, message: 'Invalid data.' });
    }

});

app.post("/transactiondata",async(req,res)=>{
    try{
        const {transactionid ,ration_card_id, logId, com_id,transactiondate, quantity, total_price } = req.body;

           // console.log(com_id);
            //console.log(total_price);
            console.log(logId);
            var log=parseInt(logId);
          

        // Your database query for insertion
        const result = await db.query(
            'INSERT INTO transaction(transaction_id, log_id,ration_card_id,commodity_id,quantity,transaction_date,amount_paid,total_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)  RETURNING *',
            [transactionid,log,ration_card_id,com_id,quantity,transactiondate,total_price,quantity]
          );
          res.status(200).json({ success: true, message: 'Authentication data received successfully.',logId});
    
    }catch(error){
        console.log(error);
    }
});
    


app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`);
});