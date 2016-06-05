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

dialog.matches('\\bperformance\\b', [askStationPerformance, detailFollowup('performance')]);

dialog.matches('\\bschedule\\b', [askSchedule, detailFollowup('schedule')]);

//dialog.matches('\\bovertime\\b', [askOvertime, detailFollowup('overtime')]);

slackBot.listenForMentions();

bot.startRTM( function(err, bot, payload) {
    if(err) {
        throw new Error('Could not connect to Slack!');
    }
});

function askStationPerformance(session, args) {
    var param = args.matches['input'].trim().split(' ');
    session.dialogData.stationName = param[0];
    session.dialogData.period = param[2];
    
    request({
        url: 'http://demo.mosi.com.tw:3003/bot/question2',
        qs: { station: param[0], time: param[2] },
        method: 'GET'
    }, function(error, response, body) {
        if(error) {
            console.log(error);
        } else {
            if(response.statusCode !== 200 || body.slice(0,11) == 'serverError') {
                session.send(prompts.generalError);
            } else {
                var result = JSON.parse(body);
                builder.Prompts.text(session, sprintf(prompts.answerPerformance, result));
            }
        }
    });
}

function askSchedule(session, args) {
    request({
        url: 'http://demo.mosi.com.tw:3003/bot/question3',
        method: 'GET'
    }, function(error, response, body) {
        if(error) {
            console.log(error);
        } else {
            if(response.statusCode !== 200 || body.slice(0,11) == 'serverError') {
                session.send(prompts.generalError);
            } else {
                var result = JSON.parse(body);
                var reply = sprintf(prompts.answerSchedule, result);
                
                if(result.delayMaster && result.delayMaster.length > 0) {
                    var appendTxt = 'Below are the delayed jobs:\n';
                    for(var i in result.delayMaster) {
                        appendTxt += "* " + result.delayMaster[i] + "\n";
                    }
                    reply += appendTxt;
                }
                builder.Prompts.text(session, reply);
            }
        }
    });
}

/*
function askOvertime(session, args) {
    var param = args.matches['input'].trim().split(' ');
    if(param.length > 3) {
        session.dialogData.period = param[2] + param[3];
    } else {
        session.dialogData.period = param[2];
    }
    
    request({
        url: 'http://demo.mosi.com.tw:3003/bot/question4',
        qs: { time: session.dialogData.period },
        method: 'GET'
    }, function(error, response, body) {
        if(error) {
            console.log(error);
        } else {
            if(response.statusCode !== 200 || body.slice(0,11) == 'serverError') {
                session.send(prompts.generalError);
            } else {
                var result = JSON.parse(body);
                console.log(result);
                var reply = sprintf(prompts.answerOvertime, result);
                
                if(result.list && result.list.length > 0) {
                    var appendTxt = '\nOvertime report:\n';
                    for(var i in result.list) {
                        var key = Object.keys(result.list[i])[0];
                        appendTxt += "* " + key + ": " + result.list[i][key] + "min.\n";
                    }
                    reply += appendTxt;
                }
                builder.Prompts.text(session, reply);
            }
        }
    });
}
*/

function detailFollowup(field) {
    return function(session, results) {
        if(results.response && results.response.slice(0,6) == 'losses') {
            if(field == 'performance') {
                request({
                    url: 'http://demo.mosi.com.tw:3003/bot/reasonList',
                    qs: { type: 'station', time: session.dialogData.period, num: 1, name: session.dialogData.stationName },
                    method: 'GET'
                }, function(error, response, body) {
                    if(error) {
                        console.log(error);
                    } else {
                        if(response.statusCode !== 200 || body.slice(0,11) == 'serverError') {
                            session.send(prompts.generalError);
                        } else {
                            var result = JSON.parse(body);
                            var reply = 'Here are the top 3 reasons for efficiency losses:\n';
                            for(var i in result.reasonList) {
                                reply += "* " + result.reasonList[i] + "\n";
                            }
                            session.send(reply);
                        }
                    }
                });
            }
            else if(field == 'schedule') {
                var param = results.response.trim().split(' ');
                var jobid = param[1]
                
                request({
                    url: 'http://demo.mosi.com.tw:3003/bot/reasonList',
                    qs: { type: 'job', num: 1, name: jobid },
                    method: 'GET'
                }, function(error, response, body) {
                    if(error) {
                        console.log(error);
                    } else {
                        if(response.statusCode !== 200 || body.slice(0,11) == 'serverError') {
                            session.send(prompts.generalError);
                        } else {
                            var result = JSON.parse(body);
                            var reply = 'Here are the top 3 reasons for efficiency losses:\n';
                            for(var i in result.reasonList) {
                                reply += "* " + result.reasonList[i] + "\n";
                            }
                            session.send(reply);
                        }
                    }
                });
            }
            else {
                session.send(prompts.abort);
            }
        } else {
            session.send(prompts.abort);
        }
    }
}