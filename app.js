var Botkit = require('botkit');
var builder = require('botbuilder');

var controller = Botkit.slackbot();
var bot = controller.spawn({
    token: 'xoxb-46601379015-0CDmgZDr6eEcFXx7SBURDhCG'
});

var slackBot = new builder.SlackBot(controller, bot);
slackBot.add('/', function(session) {
    session.send('Hello team, another fine day in the making!');
});

slackBot.listenForMentions();

bot.startRTM(function(err, bot, payload) {
    if(err) {
        throw new Error('Could not connect to Slack!');
    }
});