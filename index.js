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
    againOptionsRU,
    againOptionsEN
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
    'Выберите сумму или введите вручную',
    'Choose amount or input manually'
]

const chainMsg = [
    'Выберите сеть',
    'Choose chain'
]

const helloMsg = [
    'Выберите нужную опцию',
    'Choose the desired option'
]

const errMsg = [
    'Введите число',
    'Enter a number'
]
const tokens = ['ethereum', 'tether', 'usd-coin', 'dai', 'busd', 'bitcoin']
const chains = ['eth', 'binance', 'tron', 'polygon']
// async function startDeposit(chatId) {
// }

const lang = {}
const userToken = {}
const userChain = {}
const users = {}
const done = {}
const emailInput = {}

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
    const { address, email, chain, amountToSend, priceUSD, symbol, card } = userData
    const amount = amountToSend
    const mongoData = new user(
        {
            address,
            email,
            chain,
            amount,
            priceUSD,
            symbol,
            card
        }
    )
    console.log(address, email, chain, amountToSend, priceUSD, symbol, card)
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
        } else if (msg.text.toString().length === 16) {
            const card = msg.text
            users[chatId] = {
                card: card,
                ...users[chatId]
            }
            done[chatId] = true
            const message = `Укажите ваш кошелек для занесения его в Whitelist и зачисления токенов $MEDOS`
            await bot.sendMessage(chatId, message)    

        } else if (Number(msg.text) > 0 && userToken[chatId] && userChain[chatId] && !msg.text.toString().includes('0x')) {
            const userAmount = Number(msg.text)
            if (userChain[chatId] === 'btc') {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                const amountToSend = (1/priceUSD * userAmount).toFixed(6)
                const address = wallets.wallets.btc[0]
                users[chatId] = {
                    amountToSend,
                    priceUSD,
                    symbol
                }
                const message = lang[chatId] ? `Send ${Number(amountToSend)} ${symbol} on address ${address} then click "Done"` : `Переведите ${Number(amountToSend)} ${symbol} на данный кошелек: ${address}, затем кликните "Готово"`
                const options = lang[chatId] ? doneOptionsEN : doneOptionsRU
                await bot.sendMessage(chatId, message, options)
            } else if (userToken[chatId] === 'fiat') {
                const priceUSD = await getRubPrice()
                const amountToSend = parseInt(userAmount * priceUSD * 1.1)
                const card = wallets.wallets.fiat[0]
                users[chatId] = {
                    symbol: 'fiat',
                    amountToSend,
                    priceUSD
                }
                await bot.sendMessage(chatId, `Отправьте ${amountToSend} рублей на карту ${card} затем нажмите "Готово"`, doneOptionsRU)
            } else {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                let amountToSend = (1/priceUSD * userAmount).toFixed(6)
                if (['usd-coin', 'dai', 'tether', 'busd'].includes(userToken[chatId])) {
                    amountToSend = amountToSend < userAmount ? userAmount : Number(amountToSend).toFixed(2)
                }
                users[chatId] = {
                    amountToSend,
                    priceUSD,
                    symbol
                }
                const message = lang[chatId] ? `Send ${Number(amountToSend)} ${symbol} on address ${wallets.wallets[userChain[chatId]][0]} then click "Done"` : `Переведите ${Number(amountToSend)} ${symbol} на данный кошелек: ${wallets.wallets[userChain[chatId]][0]}, затем кликните "Готово"`
                const options = lang[chatId] ? doneOptionsEN : doneOptionsRU
                await bot.sendMessage(chatId, message, options)
            }
        } else if (done[chatId]) {
            const address = msg.text
            users[chatId] = {
                chain: userChain[chatId],
                address: address,
                ...users[chatId]
            }
            emailInput[chatId] = true
            done[chatId] = false
            const message = lang[chatId] ? `Your wallet will be included in Whitelist within 24 hours. Insert your email (just in case)` : `Спасибо! Перевод будет проверен. После проверки, Ваш кошелек появится в Whitelist в течение 24 часов. Оставьте ваш email для связи и решения возможных проблем`
            await bot.sendMessage(chatId, message)
        } else if (emailInput[chatId]) {
            const email = msg.text
            const newUserData = {
                email,
                ...users[chatId]
            }
            await save(newUserData)
            const message = lang[chatId] ? `Make sure you subscribed to our Telegram channel so you don't miss any breaking news: https://t.me/metademos_news` : `Убедитесь, что подписаны на наш Telegram канал, чтобы не пропустить срочные новости https://t.me/MetaDemosFun`
            const options = lang[chatId] ? againOptionsEN : againOptionsRU
            await bot.sendMessage(chatId, message, options)
        } else {
            console.log(userToken[chatId], userChain[chatId])
            const msg = lang[chatId] ? errMsg[lang[chatId]] : errMsg[1]
            await bot.sendMessage(chatId, msg, languageOptions)
        }
    });

    bot.on('callback_query', async (msg) => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === 'start_again') {
            userToken[chatId] = ''
            userChain[chatId] = ''
            users[chatId] = {}
            done[chatId] = false
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
                const amountToSend = (priceUSD * data).toFixed(6)
                const address = wallets.wallets.btc[0]
                const message = lang[chatId] ? `Send ${Number(amountToSend)} ${symbol} on address ${address} then click "Done"` : `Переведите ${Number(amountToSend)} ${symbol} на данный кошелек: ${address}, затем кликните "Готово"`
                const options = lang[chatId] ? doneOptionsEN : doneOptionsRU

                await bot.sendMessage(chatId, message, options)
            } else if (userToken[chatId] === 'fiat') {
                const priceUSD = await getRubPrice()
                const amountToSend = parseInt(userAmount * priceUSD * 1.1)
                const card = wallets.wallets.fiat[0]
                users[chatId] = {
                    symbol: 'fiat',
                    amountToSend,
                    priceUSD
                }
                await bot.sendMessage(chatId, `Отправьте ${amountToSend} рублей на карту ${card} затем нажмите "Готово"`, doneOptionsRU)
            } else {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                let amountToSend = (priceUSD * data).toFixed(6)
                if (['usd-coin', 'dai', 'tether', 'busd'].includes(userToken[chatId])) {
                    amountToSend = amountToSend < Number(data) ? data : Number(amountToSend).toFixed(2)
                }
                users[chatId] = {
                    amountToSend,
                    priceUSD,
                    symbol
                }
                const message = lang[chatId] ? `Send ${Number(amountToSend)} ${symbol} on address ${wallets.wallets[userChain[chatId]][0]} then click "Done"` : `Переведите ${Number(amountToSend)} ${symbol} на данный кошелек: ${wallets.wallets[userChain[chatId]][0]}, затем кликните "Готово"`
                const options = lang[chatId] ? doneOptionsEN : doneOptionsRU

                await bot.sendMessage(chatId, message, options)
            }
        }
        if(chains.includes(data)) {
            userChain[chatId] = data
            await bot.sendMessage(chatId, amountMsg[lang[chatId]], amountOptions)
        }
        if (data === 'fiat') {
            userChain[chatId] = data
            userToken[chatId] = data
            await bot.sendMessage(chatId, amountMsg[lang[chatId]], amountOptions)
        }
        if (data === 'done') {
            if (userToken[chatId] === 'fiat') {
                await bot.sendMessage(chatId, 'Укажите номер карты для проверки перевода')
            } else {
                done[chatId] = true
                const msg = lang[chatId] ? `Insert your ${userChain[chatId].toUpperCase()} wallet address to be added to the Whitelist and receive $MEDOS tokens` : `Укажите ваш кошелек в сети ${userChain[chatId].toUpperCase()} для занесения его в Whitelist и зачисления токенов $MEDOS`
                await bot.sendMessage(chatId, msg)    
            }
        }
    })

}

main()