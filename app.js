const Botkit = require('botkit');
const builder = require('botbuilder');
const request = require('request');
const sprintf = require('sprintf-js').sprintf;
const prompts = require('./prompts');

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
        qs: { token: process.env.token, user: session.userData.id },
        method: 'GET'
    }, function(error, response, body) {
        if(error) {
            console.log(error);
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

dialog.matches('\\bstatus\\b', [
    function(session) {
        request({
            url: 'http://demo.mosi.com.tw:3003/bot/question1',
            method: 'GET'
        }, function(error, response, body) {
            if(error) {
                console.log(error);
            } else {
                if(response.statusCode !== 200) {
                    session.send(prompts.generalError);
                    console.log(body);
                } else {
                    var result = JSON.parse(body);
                    console.log(result);
                    if(typeof result.expDown !== 'undefined' && result.expDown) {
                        session.send(prompts.answerStatusBreak, result);
                    } else {
                        session.dialogData.machineList = result.list;
                        builder.Prompts.text(session, sprintf(prompts.answerStatus, result));
                    }
                }
            }
        });
    },
    function(session, results) {
        if(results.response && results.response == 'detail') {
            if(session.dialogData.machineList.length == 0) {
                session.send("I haven't heard any problems from the machines.");
            } else {
                var reply = 'Here are the problematic machines:\n';
                for(var id in session.dialogData.machineList) {
                    var key = Object.keys(session.dialogData.machineList[id])[0];
                    reply += "* " + key + ": " + session.dialogData.machineList[id][key] + "\n";
                }
                session.send(reply);
            }
        } else {
            session.send(prompts.abort);
        }
    }
]);

dialog.matches('\\bperformance\\b', askStationPerformance);

dialog.matches('\\bschedule\\b', builder.DialogAction.send('You are asking for on-time schedule.'));

slackBot.listenForMentions();

bot.startRTM( function(err, bot, payload) {
    if(err) {
        throw new Error('Could not connect to Slack!');
    }
});

function askStationPerformance(session, args) {
    console.log(args)
    request({
        url: 'http://demo.mosi.com.tw:3003/bot/question2',
        qs: { station: 'TestPanel6', time: 'today' },
        method: 'GET'
    }, function(error, response, body) {
        if(error) {
            console.log(error);
        } else {
            console.log(body);
            if(response.statusCode !== 200 || body.slice(0,11) == 'serverError') {
                session.send(prompts.generalError);
            } else {
                //var result = JSON.parse(body);
                //console.log(result);
                session.send('ok');
            }
        }
    });
}