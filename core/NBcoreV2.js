const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        'GUILDS',
        'DIRECT_MESSAGES',
        'GUILD_MESSAGES'
    ],
    partials: [
        "MESSAGE", "CHANNEL"
    ]
});
const auth = require('./auth.json');
const fs = require('fs')
const event = require('events')
const em = new event.EventEmitter()
const tools = require('../module/tools')
const game = require('../module/gamelogic')

let botid;
client.login(auth.key)
client.on('ready', () => {
    console.log(`working on ${client.user.tag}`)
    botid = client.user.id
})
// --------------------------------------------------------------------------------------------------------------------------------
function MainThread(msg) {
    if (msg.content === '!help') {
        return viewhelp()
    }
    const command = tools.commandParser(msg.content, botid)
    if (command != null) {
        return game.commandSwitch(command, msg.author.id, client, msg.channelId)
    }
}


function viewhelp() {
    const helplist =
        "```" +
        "si - 簽到  |  q - 查看餘額 | g [金額] [@對象] - 轉移餘額 \n" +
        "下注 1~6 / 大小單雙 | 賠率 [1~5]：5.2 倍 [6]：6 倍 [小,單]：1.8 倍 [大,雙]：2 倍 \n" +
        "使用方式 \n" +
        "@骰子機器人 [下注] [金額]\n" +
        "notifyu - 開獎時寄送通知訊息給自己 | !notifyu - 關閉開獎訊息\n" +
        "notifyc - (於伺服器頻道內使用)開獎時寄送通知至該頻道 | !notifyc - 關閉開獎通知\n" +
        "\n\nMade by Whiter_" +
        "```"+
        "邀請連結https://discord.com/api/oauth2/authorize?client_id=991158579321122888&permissions=68608&scope=bot"
    return helplist
}


// --------------------------------------------------------------------------------------------------------------------------------
client.on('messageCreate', msg => {
    try {
        if (msg.author.id === botid) return;
        // if (!msg.guild) return;
        // if (!msg.member.user) return
        const returned = MainThread(msg)
        if (returned != null) {
            msg.reply(returned)
        }
    } catch (error) {
        console.log(error)
        return
    }
})

