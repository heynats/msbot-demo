var Botkit = require('botkit');
var builder = require('botbuilder');
var request = require('request');
var prompts = require('./prompts');

var controller = Botkit.slackbot();
var bot = controller.spawn({
    token: process.env.token
});

var slackBot = new builder.SlackBot(controller, bot);
var dialog = new builder.CommandDialog();

slackBot.add('/', dialog);

dialog.onDefault( function(session) {
    request({
        url: 'https://slack.com/api/users.info',
        qs: { token: process.env.token, user: session.userData.id},
        method: 'GET'
    }, function(error, response, body) {
        if(error) {
            console.log(error)
        } else {
            var result = JSON.parse(body)
            if(!result.ok) {
                session.send(prompts.greeting, 'stranger');
            } else {
                session.send(prompts.greeting, result.user.profile.first_name);
            }
        }
    });
});

dialog.matches('\\bhelp\\b', builder.DialogAction.send(prompts.helpMsg));

dialog.matches('\\bstatus\\b', function(session) {
    
    session.send('You are asking for current production status.');
});

dialog.matches('\\bperformance\\b', builder.DialogAction.send('You are asking for station performance.'));

dialog.matches('\\bschedule\\b', builder.DialogAction.send('You are asking for on-time schedule.'));

slackBot.listenForMentions();

bot.startRTM( function(err, bot, payload) {
    if(err) {
        throw new Error('Could not connect to Slack!');
    }
});