module.exports = {
    helpMsg: "I can help you with briefings to find out how our production is doing. You can ask me things like:\n\n" +
    "* what's the status?\n" +
    "* Line3 performance today\n" +
    "* are we on schedule?\n" +
    "* overtime needed yesterday" +
    "\nSay 'nevermind' during our conversation to let me back to work!",
    greeting: "Hi %s, how may I help you?",
    abort: "Sure, glad to help.",
    generalError: "Sorry I'm having trouble retrieving information...",
    answerStatus: "%(production)f%% of the machines are working on assigned jobs, and %(normal)f%% of those machines are running normally.\n" +
    "Say _detail_ for a list of problematic machines.",
    answerStatusBreak: "We are having a break from %(expDown)s.",
    answerPerformance: "OEE of the requested period was %(oee)f%% (Availability: %(availability)f%%; Speed: %(speed)f%%; Quality: %(quality)f%%).\n" +
    "Say _losses_ to show top 3 losses affecting performance during the period.",
    answerSchedule: "%(onTimeRate)f%% of the jobs currently in production are on track to finish in time.",
    answerOvertime: "Total overtime of the requested period were %(total)d minutes."
}