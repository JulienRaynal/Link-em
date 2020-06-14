
'use strict';

// Objects we're able to manipulate
let objects = [
  {
    name : "lampe",
    state : "false",
    id : 1,
  },
  {
    name : "radiateur",
    state : "false",
    id : 2
  },
  {
    name : "ventilateur",
    state : false,
    id : 3,
  },
];


// HTTP request

const request = require('request');
var options = {
  'method': "POST",
  'url': "URL",
  'headers': {
      'Content-Type': "application/json"
  },
  body: {
    //SI PAS EN GET TU PEUX METTRE DES TRUCS
  }  
};
request(options, function (error, response) {
  if (error) throw new Error(error);
    //Les traitements que tu veux 
});



// Import the Dialogflow module from the Actions on Google client library.
const {
    dialogflow,
    Permission,
    Suggestions,
  } = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Holds the object to update
let ObjectToUpdate = {};

// Handle the Dialogflow intent named 'Object Status'.
// The intent collects a parameter named 'color'.
app.intent('Object Status', (conv, {object}) => {
    const audioSound = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';

    let needToBePoweredOn = false;
    for (let i; i < objects.length; i++) {
      if (objects[i].name === object) {
        ObjectToUpdate = objects[i];

        if(object[i].state !== false) {
          needToBePoweredOn = true;
        } else if (object[i].state !== true) {
          needToBePoweredOn = false;
        }

      }
    }
    if (conv.data.userName) {
        // If we collected user name previously, adress them by name and use SSML to embed an audio snippet in the response.
        if (needToBePoweredOn === true) {
          conv.close(`<speak>${conv.data.userName}, Ok nous avons allumé 
          ${ObjectToUpdate.name}.<audio src="${audioSound}"></audio></speak>`);
        } else {
          conv.close(`<speak>${conv.data.userName}, Ok nous avons éteint 
          ${ObjectToUpdate.name}.<audio src="${audioSound}"></audio></speak>`);
        }
    } else {
      if (needToBePoweredOn === true) {
        conv.close(`<speak>Ok nous avons allumé ${ObjectToUpdate.name}.<audio src="${audioSound}"></audio></speak>`);
    } else {
      conv.close(`<speak>Ok nous avons éteint 
      ${ObjectToUpdate.name}.<audio src="${audioSound}"></audio></speak>`);
    }
  }
});

// Handle the DialogFlow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
    conv.ask(new Permission({
        context: 'Salut, pour nous permettre de mieux te connaitre',
        permissions: 'NAME'
    }));
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'.
// If user agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
    if (!permissionGranted) {
        conv.ask('Ok, pas de problème. Quel objet souhaite tu manipuler ?');
        conv.ask(new Suggestions('lampe', 'radiateur', 'ventilateur'));
    } else {
        conv.data.userName = conv.user.name.display;
        conv.ask(`Bonjour, ${conv.data.userName}. Quel objet souhaite tu manipuler ?`);
        conv.ask(new Suggestions('lampe', 'radiateur', 'ventilateur'));
    }
})







// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({
  origin: true,
});
// [END additionalimports]

exports.status = functions.https.onRequest((req, res) => {
  if (req.method === 'PUT') {
    return res.status(403).send('Forbidden!');
  }

  return cors(req, res, () => {
    let format = req.query.format;

    if (!format) {
      format = req.body.format;
    }
    let objectList = '';
    objects.forEach(object => {
      objectList += 
      `{
        "id": ${object.id},
        "state": ${object.state},
        "name": "${object.name}",
        },`;
    });
    console.log('Sending Formatted date:', objectList);
    res.status(200).send(objectList);
  });
});
// Expose Express API as a single Cloud Function:
// The Json will be available through this link : https://us-central1-openconnexion-dbb45.cloudfunctions.net/status
exports.widgets = functions.https.onRequest(app);