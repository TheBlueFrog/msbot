var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();

var helloBot = new builder.BotConnectorBot();
helloBot.add('/', new builder.CommandDialog()
    .matches('^set name', builder.DialogAction.beginDialog('/profile'))
    .matches('^quit', builder.DialogAction.endDialog())
    .onDefault(function (session) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            session.send('Hello %s!', session.userData.name);
        }
    }));
helloBot.add('/profile',  [
    function (session) {
        if (session.userData.name) {
            builder.Prompts.text(session, 'What would you like to change it to?');
        } else {
            builder.Prompts.text(session, 'Hi! What is your name?');
        }
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

server.use(helloBot.verifyBotFramework({ appId: 'Ihavenoideawhattoputhere', appSecret: '1d29571daa80409494745524a5ecaf45' }));
server.post('/v1/messages', helloBot.listen());

function send(req, res, next) {
    console.log('send: req.params.name is %s', req.params.name);
    if (req.params.name === 'x') {
        console.log('req.params.name is x serve page');
        return restify.serveStatic({
            'directory': './html/Support',
            'default': 'Slack.html'
        })
    }
    else {
        res.send('not x' + req);
        return next();
    }
 }
 
//server.get('/X:name', send);

// !!!!!!! this is not working, can't figure out
// how serverStatic works...
//
//function(req, res, next) {
//  console.log(req.params[0]);
//  console.log(req.params[1]);
server.get(/\/Support\/?.*/, restify.serveStatic({
            'directory': './html/Support',
            'default': 'Slack.html'})
//   res.send(200);
//   return next();
)



// Serve a static web page
server.get(/.*/, restify.serveStatic({
       'directory': './html',
	    'default': 'index.html'
   })
//   return next();
);

server.listen(process.env.port, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
