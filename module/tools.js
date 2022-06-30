function betconverter(bet) {
    const quantifier = {
        "w": 10000,
        "e": 100000000
    }
    let pointer = 0;
    while (pointer < bet.length) {
        if (Number.isInteger(parseInt(bet[pointer]))) {
            pointer++
        } else {
            if (bet[pointer].toLowerCase() in quantifier) {
                return parseInt(bet.substring(0, pointer)) * quantifier[bet[pointer].toLowerCase()];
            } else {
                return null
            }
        }
    }
    return parseInt(bet)
}

function numberComma(num) {
    let comma = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
    return num.toString().replace(comma, ',')
}

function commandParser(content, id) {
    const command = content.split(' ').filter(v => v);
    if (command[0] === `<@${id}>`) {
        command.shift()
        return command
    }else{
        return null
    }
}

module.exports = { betconverter, numberComma, commandParser }