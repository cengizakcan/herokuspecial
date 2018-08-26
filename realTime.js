let App         = require('express')();
let Http        = require('http').Server(App);
let Https       = require('https');
let Io          = require('socket.io')(Http);
let url         = require('url');
let Parser      = require("body-parser");
let colors      = require('colors');
let fs      	= require('fs');

Io.origins('*:*');

let $customerList   = [];
let $userList       = [];


App.use(Parser.urlencoded({ extended: false }));
    App.use(Parser.json());
/*
    App.get('/', (request, response) => {

       response.send("Hello World. :)");

    });
*/
    App.post('/b2cNotification', (request, response) => {

        response.send("ALBUM");

        Io.emit("receiver",
            {
                status:             request.body.status,
                transmitter:        request.body.transmitter,
                receiver:           request.body.receiver,
                title:              request.body.title,
                message:            request.body.message,
                icon:               request.body.icon,
                extra:              request.body.extra
            }
        );

    });

    Io.on('connection', function(socket){

        socket.on('transmitter', function(msg){

            socket.emit('receiver', msg);
            socket.broadcast.emit('receiver', msg);

        });
		
		socket.on('screenRequest', function(msg){

            socket.emit('screenSender', msg);
            socket.broadcast.emit('screenSender', msg);

        });


        let $clientUuid = socket.handshake.query.clientUuid;
        let $clientType = socket.handshake.query.clientType;


       if($clientType === "customer"){
           if ($customerList.indexOf($clientUuid)) {
               $customerList.push($clientUuid);
               socket.emit('customer',             $customerList);
               socket.broadcast.emit('customer',   $customerList);
           }
       }

       if($clientType === "user"){
           if ($userList.indexOf($clientUuid)) {
               $userList.push($clientUuid);
               socket.emit('user',              $userList);
               socket.broadcast.emit('user',    $userList);
           }
       }


       if($clientType === "admin"){

            socket.emit('user',         $userList);
            socket.emit('customer',     $customerList);

       } 

        socket.on('disconnect', function(msg){

            socket.emit('receiver',             msg);
            socket.broadcast.emit('receiver',   msg);


           if ($clientType === "customer") {
                $customerList.splice($customerList.indexOf($clientUuid), 1);
                socket.emit('customer',             $customerList);
                socket.broadcast.emit('customer',   $customerList);
           }

           if ($clientType === "user") {
               $userList.splice($userList.indexOf($clientUuid), 1);
                socket.emit('user',             $userList);
                socket.broadcast.emit('user',   $userList);
           }

        });

    });
	

 
    let optionsSsl = {
        port:80,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
            'Access-Control-Allow-Credentials': true,
        },
		log: false,
		agent: false,
		origins: '*:*',
		transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
    };
 
    Https.createServer(App).listen(optionsSsl, ()=> {
		console.log("ssl istek")
	});

	
 