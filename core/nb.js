const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const auth = require('../auth.json');
const fs = require('fs')
const event = require('events')
const em = new event.EventEmitter()


client.login(auth.key)
let botid;
let playerdata = {};
client.on('ready', () => {
    console.log(`working on ${client.user.tag}`)
    botid = client.user.id
})


// functions














// event listener
let channel;
let nowablebet = true;
em.on('set-dice-roll', () => {
    const latency = 20
    channel.send(`**將於${latency}秒後開獎**`)
    setTimeout(() => {
        channel.send('**準備於5秒後開獎，停止下注**')
        nowablebet = false
    }, 1000 * (latency - 5))
    setTimeout(() => {
        const diceResult = diceTossed()
        channel.send(`開獎成功： ${diceResult}`)
        em.emit('dice-result', diceResult)
        betstack = []
        nowablebet = true
    }, 1000 * latency)
})


em.on('dice-result', (dice) => {
    const rate = [5.2, 6, 1.8, 2]
    betstack.map(v => {
        switch (v.bet) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                if (v.bet === '' + dice) {
                    channel.send(`${v.id} 恭喜您下注 ${v.bet} ，贏得 ${numberComma(v.mount * rate[0])} 遊戲幣`)
                    whenWinning(v.id, v.mount * rate[0])
                }
                break;
            case '6':
                if (dice === 6) {
                    channel.send(`${v.id} 恭喜您下注 ${v.bet} ，贏得 ${numberComma(v.mount * rate[1])} 遊戲幣`)
                    whenWinning(v.id, v.mount * rate[1])
                }
                break;
            case '小':
                if ('123'.indexOf(`${dice}`) !== -1) {
                    channel.send(`${v.id} 恭喜您下注 ${v.bet} ，贏得 ${numberComma(v.mount * rate[2])} 遊戲幣`)
                    whenWinning(v.id, v.mount * rate[2])
                }
                break;
            case '大':
                if ('456'.indexOf(`${dice}`) !== -1) {
                    channel.send(`${v.id} 恭喜您下注 ${v.bet} ，贏得 ${numberComma(v.mount * rate[3])} 遊戲幣`)
                    whenWinning(v.id, v.mount * rate[3])
                }
                break;
            case '單':
                if ('135'.indexOf(`${dice}`) !== -1) {
                    channel.send(`${v.id} 恭喜您下注 ${v.bet} ，贏得 ${numberComma(v.mount * rate[2])} 遊戲幣`)
                    whenWinning(v.id, v.mount * rate[2])
                }
                break;
            case '雙':
                if ('246'.indexOf(`${dice}`) !== -1) {
                    channel.send(`${v.id} 恭喜您下注 ${v.bet} ，贏得 ${numberComma(v.mount * rate[3])} 遊戲幣`)
                    whenWinning(v.id, v.mount * rate[3])
                }
                break;
        }
    })
    updateDataBase()
})

// event on client

client.on('messageCreate', msg => {
    try {
        if (msg.member.user.bot) return;
        if (!msg.guild) return;
        if (!msg.member.user) return

        readDataBase().then(res => {
            // msg.channel.send(msg.author.toString())
            channel = client.channels.cache.get(msg.channelId)
            if (msg.mentions.has(botid)) {
                let command = msg.content.split(' ')
                if ('123456大小單雙'.indexOf(command[1]) != -1) {
                    const bet = betconverter(command[2])
                    if (checkbalance(msg.author.toString(), bet)) {
                        if (nowablebet) {
                            if (bet != false) {
                                onBet(msg.author.toString(), command[1], bet) && msg.reply(`下注成功！${command[1]}，${numberComma(bet)}`)
                            } else {
                                msg.reply('錯誤的指令，請重新下注')
                            }
                        } else {
                            msg.channel.send('現在不是投注時間')
                        }
                    } else {
                        msg.reply('餘額不足')
                    }
                } else {
                    switch (command[1].toLowerCase()) {
                        case 'si':
                            isUserValid(msg.author.toString()) &&
                                userSignIn(msg.author.toString()) ?
                                msg.reply(`恭喜您簽到成功，獲得遊戲幣${numberComma(10000000)}元`) :
                                msg.reply('今天已簽到過，請明天再來')
                            break;
                        case 'h':
                            msg.channel.send(`歷史開獎紀錄：${history.join(" ")}`)
                            break;
                        case 'q':
                            msg.reply(`${numberComma(playerdata[msg.author.toString()].balance)}`)
                            break;
                        default:
                            msg.reply('錯誤的指令')
                            break;
                    }
                }
            }
        })
    } catch (error) {
        return
    }


})








