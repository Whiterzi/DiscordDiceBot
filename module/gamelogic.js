
const data = require('../data/datas');
const tools = require('../module/tools')

const event = require('events');
const em = new event.EventEmitter();

let clients;

let nowbetable = true;
em.on('game-roll', () => {
    const timetoroll = 30;
    let result;
    const NotifyList = data.notifyListControll(['get'])
    const NotifyChannel = data.notifyChannelControll(['get'])
    setTimeout(() => {
        sendNotify(NotifyList, '**將在30秒後開獎**')
        sendChannelNotify(NotifyChannel, '**將在30秒後開獎**')
        setTimeout(() => {
            nowbetable = false
            sendNotify(NotifyList, "將在5秒後開獎，停止下注")
            sendChannelNotify(NotifyChannel, "將在5秒後開獎，停止下注")
        }, 1000 * (timetoroll - 5))
        setTimeout(() => {
            result = diceTossed()
            sendNotify(NotifyList, `**開獎成功：${result}**`)
            sendChannelNotify(NotifyChannel, `**開獎成功：${result}**`)
            data.historyControll(['push', result])
            BetResult(result)
            nowbetable = true
        }, 1000 * timetoroll)
    }, 3000)
})

function sendNotify(notifylist, content) {
    notifylist.map(v => {
        clients.users.fetch(v, false).then((user) => {
            user.send(content);
        })
    })
}

function sendChannelNotify(notifyChannel, content) {
    notifyChannel.map(v => {
        clients.channels.cache.get(v).send(content)
    })
}


function diceTossed() {
    let base = Math.floor(Math.random() * 100 + 1)
    let pointer = 0;
    while (pointer < data.getConstant().numberRate.length) {
        base -= data.getConstant().numberRate[pointer]
        if (base <= 0) {
            return pointer + 1
        } else {
            pointer++
        }
    }
}

function betWinning(id, bet, amount, rate) {
    let reward = amount * rate
    data.playerdataControll(['balance-change', { id: id, amount: reward }])
    clients.users.fetch(id, false).then((user) => {
        user.send(`<@${id}> 恭喜您下注 ${bet} ，贏得 ${tools.numberComma(reward)} 遊戲幣`);
    })
}
function BetResult(result) {
    data.betstackControll(['get']).map(v => {
        switch (v.bet) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                if (v.bet === result + '') {
                    return betWinning(v.id, v.bet, v.amount, 5.2)
                }
                break;
            case '6':
                if (v.bet === '6') {
                    return betWinning(v.id, v.bet, v.amount, 6)
                }
                break;
            case '小':
                if ([1, 2, 3].indexOf(result) != -1) {
                    return betWinning(v.id, v.bet, v.amount, 1.8)
                }
                break;
            case '單':
                if ([1, 3, 5].indexOf(result) != -1) {
                    return betWinning(v.id, v.bet, v.amount, 1.8)
                }
                break;
            case '大':
                if ([4, 5, 6].indexOf(result) != -1) {
                    return betWinning(v.id, v.bet, v.amount, 2)
                }
                break;
            case '雙':
                if ([2, 4, 6].indexOf(result) != -1) {
                    return betWinning(v.id, v.bet, v.amount, 2)
                }
                break;
            default:
                break;
        }
    })
    data.betstackControll(['drop'])
}


function BetEvent(commandinput, userId) {
    let [bet, amount] = commandinput;
    amount = tools.betconverter(amount);
    if (amount === null) { return '輸入的金額錯誤' }
    if (playerBalanceChecker(userId) - amount >= 0) {
        let playerbet = data.getConstant().betFormat(userId, bet, amount)
        data.playerdataControll(['balance-change', { id: userId, amount: -amount }])
        if (data.betstackControll(['push', playerbet])) {
            if (data.betstackControll(['get']).length === 1) {
                em.emit('game-roll')
            }
            return `投注成功！ 類型： ${bet} | ${tools.numberComma(amount)}，餘額：${tools.numberComma(data.playerdataControll(['get'])[userId].balance)}`
        } else {
            return '投注失敗'
        }
    } else {
        return '您的餘額不足'
    }
}
function playerBalanceChecker(id) {
    if (id in data.playerdataControll(['get'])) {
        return data.playerdataControll(['get'])[id].balance
    } else {
        return 0;
    }
}

function playSignIn(id) {
    const date = new Date(Date.now())
    let playerData = data.playerdataControll(['get'])
    const Reward = tools.betconverter(data.getConstant().signReward)
    if (id in playerData && playerData[id].lastsign != date.getDate()) {
        playerData = playerData[id]
        playerData.balance += Reward
        playerData.lastsign = date.getDate()
        data.playerdataControll(['update', { key: id, value: playerData }])
        return `恭喜您簽到成功，獲得遊戲幣${tools.numberComma(Reward)}元`
    } else if (id in playerData && playerData[id].lastsign === date.getDate()) {
        return '今天已簽過，請明天再來'
    } else {
        data.playerdataControll(['push', id])
        return `恭喜您簽到成功，獲得遊戲幣${tools.numberComma(Reward)}元`
    }
}

function balanceGive(id, amount, target) {
    let playerdata = data.playerdataControll(['get'])
    target = target.substring(2, target.length - 1)
    amount = tools.betconverter(amount)
    if (id in playerdata && playerdata[id].balance >= amount) {
        if (target in playerdata) {
            data.playerdataControll(['balance-change', { id: id, amount: -amount }])
            data.playerdataControll(['balance-change', { id: target, amount: amount }])
            return '轉帳成功'
        } else {
            return '對象尚未使用過本系統'
        }
    } else {
        return '您的餘額不足'
    }
}



function commandSwitch(commandinput, userId, client, channelId) {
    let [command, amount, target] = commandinput;
    clients = client;
    if ('123456大小單雙'.indexOf(command) != -1) {
        return BetEvent([command, amount], userId);
    } else {
        switch (command.toLowerCase()) {
            case 'q':
                return tools.numberComma(playerBalanceChecker(userId))
            case 'qa':
                break;
            case 'si':
                return playSignIn(userId)
            case 'h':
                return `歷史開獎紀錄：${data.historyControll(['get']).join(' ')}`
            case 'g':
                return balanceGive(userId, amount, target)
            case 'notifyu':
                data.notifyListControll(['push', userId])
                return '已開啟開獎通知'
            case '!notifyu':
                data.notifyListControll(['delete', userId])
                return '已關閉開獎通知'
            case 'notifyc':
                data.notifyChannelControll(['push', channelId])
                return '已開啟此頻道開獎通知'
            case '!notifyc':
                data.notifyChannelControll(['delete', channelId])
                return '已關閉此頻道開獎通知'
            case 'starburst':
                return '星爆氣流斬'
            case 'settingChannel':
                break;
            default:
                return '無效的指令'
        }
    }
}

module.exports = { commandSwitch }