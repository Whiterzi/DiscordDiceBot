

const Constant = {
    playInitialState: (id) => (
        {
            id: id,
            balance: 100000000,
            lastsign: -1,
        }),
    betFormat: (id, bet, amount) => ({
        id: id,
        bet: bet,
        amount: amount
    }),
    numberRate: [0,0,0,0,100,0],
    signReward: '1e',
}
// [17, 17, 17, 17, 17, 15]
let betstack = []
let history = []
let playerdata = {}
let NotifyList = []
let NotifyChannel = []

function getConstant() {
    return Constant
}

function betstackControll(command) {
    let [condition, data] = command
    switch (condition) {
        case 'get':
            return betstack;
        case 'push':
            betstack.push(data)
            return true;
        case 'drop':
            betstack = [];
            break;
        default:
            return false;
    }
}

function historyControll(command) {
    let [condition, data] = command
    switch (condition) {
        case 'get':
            return history;
        case 'push':
            history.push(data)
            if (history.length > 15) history.shift()
            break;
        default:
            break;
    }
}

function playerdataControll(command) {
    let [condition, data] = command
    switch (condition) {
        case 'get':
            return playerdata;
        case 'push':
            playerdata[data] = Constant.playInitialState(data)
            break;
        case 'update':
            playerdata[data.key] = data.value;
            break;
        case 'balance-change':
            playerdata[data.id].balance += data.amount;
            break;
        default:
            break;
    }
}

function notifyListControll(command) {
    let [condition, data] = command
    switch (condition) {
        case 'get':
            return NotifyList;
        case 'push':
            if (NotifyList.indexOf(data) == -1) {
                NotifyList.push(data)
                return true
            } else {
                return false
            }
        case 'delete':
            NotifyList.splice(NotifyList.indexOf(data), 1)
            break;
        default:
            break;
    }
}

function notifyChannelControll(command) {
    let [condition, data] = command
    switch (condition) {
        case 'get':
            return NotifyChannel;
        case 'push':
            if (NotifyChannel.indexOf(data) == -1) {
                NotifyChannel.push(data)
                return true
            } else {
                return false
            }
        case 'delete':
            NotifyChannel.splice(NotifyChannel.indexOf(data), 1)
            break;
        default:
            break;
    }
}

module.exports = { getConstant, betstackControll, historyControll, playerdataControll, notifyListControll ,notifyChannelControll}