module.exports = {
    helpMsg: "I can help you with briefings to find out how our production is doing. You can ask me things like:\n\n" +
    "* what's the status?\n" +
    "* show me the performance of Line3\n" +
    "* are we on schedule?\n" +
    "\nSay 'nevermind' during our conversation to let me back to work!",
    greeting: "Hi %s, how may I help you?",
    abort: "Sure, glad to help.",
    generalError: "Sorry I'm having trouble retrieving information...",
    answerStatus: "%(production)f%% of the machines are working on assigned jobs, and %(normal)f%% of those machines are running normally.\n" +
    "Say _detail_ for a list of problematic machines.",
    answerStatusBreak: "We are having a break from %(expDown)s.",
    answerPerformance: "",
    answerSchedule: "",
}