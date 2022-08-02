const TelegramBot = require('node-telegram-bot-api')
const wallets = require('./wallets')
const { mainOptionsRU,
    mainOptionsEN,
    privateRoundOptionsEN,
    privateRoundOptionsRU,
    amountOptions,
    tokenOptionsRU,
    tokenOptionsEN,
    chainOptions,
    languageOptions,
    doneOptionsRU,
    doneOptionsEN,
    againOptions
}  = require('./options')
const request = require('request');
const convert = require('xml-js');
const mongoose = require('mongoose');
const user = require('./models/user')
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DB_NAME}.net`

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true})

const tokenMsg = [
    'Выберите токен',
    'Choose token'
]

const amountMsg = [
    'Выберите сумму',
    'Choose amount'
]

const chainMsg = [
    'Выберите сеть',
    'Choose chain'
]

const helloMsg = [
    'Выберите нужную опцию',
    'Choose the desired option'
]

const tokens = ['ethereum', 'tether', 'usd-coin', 'dai', 'busd', 'bitcoin']
const chains = ['eth', 'binance', 'tron', 'polygon']
// async function startDeposit(chatId) {
// }

const lang = {}
const userToken = {}
const userChain = {}
const users = {}
async function getTokenUSDPrice (tokenSymbol) {
    const url = `https://api.coingecko.com/api/v3/coins/${tokenSymbol}?localization=true`
    return new Promise((resolve, reject) => {
        request({
            uri: url,
            method: 'GET',
            encoding: 'utf-8'
        }, function (error, response, body) {
            const json = JSON.parse(body)
            const price = json.market_data.current_price.usd
            const symbol = json.symbol
            const result = [price, symbol]
            resolve(result)
        })
    })
}

async function getRubPrice() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const currentDate = dd + '/' + mm + '/' + yyyy;
    const cbrApiUrl = 'https://www.cbr.ru/scripts/XML_daily.asp?date_req=' + currentDate
    return new Promise((resolve, reject) => {
        request({
            uri: cbrApiUrl,
            method: 'GET',
            encoding: 'utf-8'
        }, function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            // console.log('statusCode:', response.toString() && response.statusCode); // Print the response status code if a response was received
            const result = convert.xml2json(body, {compact: true, spaces: 4});
            const json = JSON.parse(result)
            const valutes = json.ValCurs.Valute
            for (let i = 0; i < valutes.length; ++i) {
                if (valutes[i].CharCode._text == 'USD') {
                    resolve(parseFloat(valutes[i].Value._text.replace(/,/g, '.')))
                }
            }
          });
    })
}

async function save (userData) {
    console.log(userData)
    const { hash, amountToSend, priceUSD, symbol } = userData
    console.log(hash, amountToSend, priceUSD, symbol)
    const amount = amountToSend
    const mongoData = new user(
        {
            hash,
            amount,
            priceUSD,
            symbol
        }
    )
    mongoData.save((err, doc) => {
        if (!err) {
            console.log('success', 'User added successfully!');
        } else {
            console.log('Error during record insertion : ' + err);
        }
    });
}

async function main () {

    mongoose
        .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((res) => {
            console.log('Connected db')
        })
        .catch((error) => console.log(error));
    
    bot.setMyCommands([
        {command: '/start', description: 'Main function'},
    ])

    bot.on('message', async (msg) => {
        const text = msg.text
        const chatId = msg.chat.id
        if (text === '/start') {
            await bot.sendMessage(chatId, `Choose language / Выберите язык`, languageOptions)
        }
    });
    bot.onText (/\/saymyname (.+)/, (msg, match) => {
        let name = match [1];
        bot.sendMessage (msg.chat.id, `Hello ${name}!`);   //pay attention to the type of quotes
    })
    bot.on('callback_query', async (msg) => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === 'start_again') {
            userToken[chatId] = ''
            userChain[chatId] = ''
            users[chatId] = {}
            const options = lang[chatId] ? mainOptionsEN : mainOptionsRU
            await bot.sendMessage(chatId, helloMsg[lang[chatId]], options)
        }
        if (data === 'ru' || data === 'en') {
            lang[chatId] = data === 'ru' ? 0 : 1
            const options = lang[chatId] ? mainOptionsEN : mainOptionsRU
            await bot.sendMessage(chatId, helloMsg[lang[chatId]], options)
        }
        if (data === 'private_round') {
            const options = lang[chatId] ? privateRoundOptionsEN : privateRoundOptionsRU
            await bot.sendMessage(chatId, 'Private round', options)
        }
        if (data === 'buy') {
            const options = lang[chatId] ? tokenOptionsEN : tokenOptionsRU
            await bot.sendMessage(chatId, tokenMsg[lang[chatId]], options)
        }

        if (tokens.includes(data)) {
            if (data === 'bitcoin') {
                userToken[chatId] = 'bitcoin'
                userChain[chatId] = 'btc'
                await bot.sendMessage(chatId, amountMsg[lang[chatId]], amountOptions)
            } else {
                userToken[chatId] = data
                await bot.sendMessage(chatId, chainMsg[lang[chatId]], chainOptions)
            }
        }
        if(Number(data) > 0) {
            const userAmount = data
            if (userChain[chatId] === 'btc') {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                const amountToSend = (1/priceUSD * data).toFixed(6)
                const address = wallets.wallets.btc[0]
                await bot.sendMessage(chatId, `Send ${Number(amountToSend)} ${symbol} on address ${address} then click "Done"`, doneOptionsEN)
            } else if (userToken[chatId] === 'fiat') {
                const priceRubToUsd = await getRubPrice()
                const amountToSend = parseInt(userAmount * priceRubToUsd)
                const card = wallets.wallets.fiat[0]
                await bot.sendMessage(chatId, `Отправьте ${amountToSend} рублей на карту ${card} затем нажмите "Оплатил"`, doneOptionsRU)
            } else {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                let amountToSend = (priceUSD * data).toFixed(6)
                if (['usd-coin', 'dai', 'tether', 'busd'].includes(userToken[chatId]) && amountToSend < data) {
                    amountToSend = data
                }
                users[chatId] = {
                    amountToSend,
                    priceUSD,
                    symbol
                }
                await bot.sendMessage(chatId, `Send ${Number(amountToSend)} ${symbol} on address ${wallets.wallets[userChain[chatId]][0]} then click "Done"`, doneOptionsEN)
            }
        }
        if(chains.includes(data)) {
            userChain[chatId] = data
            await bot.sendMessage(chatId, amountMsg[lang[chatId]], amountOptions)
        }
        if (data === 'fiat') {
            userToken[chatId] = data
            await bot.sendMessage(chatId, amountMsg[lang[chatId]], amountOptions)
        }
        if (data === 'done') {
            const hashPrompt = await bot.sendMessage(chatId, `Send an transaction hash`, {
                reply_markup: {
                    force_reply: true,
                },
            })
            bot.onReplyToMessage(chatId, hashPrompt.message_id, async (msg) => {
                const hash = msg.text
                const newUsersData = {
                    chain: userChain,
                    hash,
                    ...users[chatId]
                }
                await save(newUsersData)
                await bot.sendMessage(chatId, `Your wallet will be included in Whitelist within 24 hours`, againOptions)
            });
            // await bot.sendMessage(chatId, 'Enter an transaction hash:', againOptions)

        }
    })

}

main()