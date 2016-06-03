var Botkit = require('botkit');
var builder = require('botbuilder');

var controller = Botkit.slackbot();
var bot = controller.spawn({
    token: process.env.token
});

var slackBot = new builder.SlackBot(controller, bot);
var dialog = new builder.CommandDialog();

slackBot.add('/', dialog);

dialog.onDefault( function(session) {
    session.send('Hello, another fine day in the making! How may I help you?');
});

dialog.matches('status', builder.DialogAction.send('You are asking for current production status.'));

dialog.matches('performance', builder.DialogAction.send('You are asking for station performance.'));

dialog.matches('schedule', builder.DialogAction.send('You are asking for on-time schedule.'));

slackBot.listenForMentions();

bot.startRTM( function(err, bot, payload) {
    if(err) {
        throw new Error('Could not connect to Slack!');
    }
});