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
    againOptionsEN,
    whiteListOptionsEN,
    whiteListOptionsRU,
    checkUserOptionsEN,
    checkUserOptionsRU,
    detailsOptionsEN,
    detailsOptionsRU,
    amountOptionsEN,
    amountOptionsRU
}  = require('./options')
const request = require('request');
const convert = require('xml-js');
const mongoose = require('mongoose');
const user = require('./models/user');
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
    `Привет! Я бот NFT GameFi проекта Meta Demos.🤖\n🤞Ты нашел меня и это не случайно! Здесь мы проводим Private Round: продажа токенов проекта по цене ниже TGE\n🔥Количество мест ограничено, поэтому не будем терять время! Ты с нами? ⏰`,
    `Hey, I'm the bot of Meta Demos project.🤖\n🤞You found me, and it's no accident! Here we are holding a Private Round: project token SALE below TGE\n🔥Places are limited, so let's not waste any time! Are you in? ⏰`
]

const detailsMsg = [
    `❗️Хорошая традиция в индустрии — ранние инвесторы получают самую выгодную цену при покупке токена до листинга: сейчас цена на 40% ниже предстоящего IDO и гораздо ниже TGE.\nПродать токен на бирже, зафиксировав прибыль или оставить на будущее, ожидая иксов, — ваше личное дело.\n⌛ Количество мест:\n50$ — 500 человек\n100$ — 100 человек\n500$ — 25 человек\n1000$ — 10 человек\nПроведя покупку, адрес вашего кошелька появится в Whitelist. Токены MEDOS будут поступать на него сразу после листинга.\n1 Medos = $ 0,012\n10% TGE, 1 месяц cliff, ежедневный vesting в течение года.\n📲 Не забывайте вступать в наши соцсети, чтобы следить за новостями`,
    `❗️The wonderful tradition in the industry says that early investors get the best price when buying tokens before listing: the price is now 40% lower than the upcoming IDO and far below the TGE.\nSelling the token on the exchange to lock in a profit or leave tokens for the future, awaiting profit multiplication is entirely up to you!\n⌛ Capacity:\n$50 - 500 people\n$100 - 100 people\n$500 - 25 people\n$1,000 - 10 people\nAfter the purchase, your wallet address will appear on Whitelist. MEDOS tokens will go to the wallet immediately after listing.\n1 Medos = $ 0,012\n10% TGE, 1-month cliff, daily vesting for a year.\n📲 Don't forget to join our social networks to keep up with the news!`,
]

const errMsg = [
    'Введите число',
    'Enter a number'
]
const tokens = ['ethereum', 'tether', 'usd-coin', 'dai', 'binance-usd', 'bitcoin']
const tokenSymbols = {'tether': 'USDT', 'usd-coin': 'USDC', 'dai': 'DAI', 'binance-usd': 'BUSD'}
const chains = ['eth', 'binance', 'tron', 'polygon']
// async function startDeposit(chatId) {
// }

const lang = {}
const userToken = {}
const userChain = {}
const users = {}
const done = {}
const emailInput = {}
const checkUser = {}
const stage = {}
const tokenAddresses = ['']
async function getTokenUSDPrice (tokenSymbol) {
    return [1.02, tokenSymbol]
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

async function save (userData, username) {
    const { address, chain, amountToSend, priceUSD, amountUSD, symbol, card, hash } = userData
    const amount = amountToSend
    const email = ''
    const depositData = 
    {
        address,
        hash,
        email,
        chain,
        amount,
        amountUSD,
        priceUSD,
        symbol,
        card,
    }
    console.log('Trying to add deposit', username, depositData)
    user.findOneAndUpdate({username: username}, {$push: {deposits: depositData}, updatedAt: Date.now()}, function (err, res) {
        if(err) {
            console.log(err)
        } else {
            console.log('User updated', res)
        }
    })
    // user.updateMany({username: users[chatId].username}, mongoData, function (err, res) {
    //     if(err) {
    //         console.log(err)
    //     } else {
    //         console.log('User updated', res)
    //     }
    // })

}

async function saveEmail(email, username) {
    console.log(email)

    user.updateOne(
        {username: username}, 
        { "$set": { "deposits.$[].email": email } }, 
        function (err, res) {
            if(err) {
                console.log(err)
            } else {
                console.log('User updated', res)
            }
    })
}

async function initUser(username) {
    const mongoData = new user(
        {
            username,
            deposits: [],
            updatedAt: Date.now()
        }
    )
    const usersData = await user.find({})
    const userIndex = usersData.findIndex(item => item.username === username)
    if (userIndex === -1) {
        mongoData.save()
    } 
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
            await initUser(msg.from.username)
            users[chatId] = {
                username: msg.from.username
            }
            const a = await user.find({username: msg.from.username})
            console.log(a)
            await bot.sendMessage(chatId, `Choose language / Выберите язык`, languageOptions)
        } else if (msg.text && stage[chatId] === 'hash_input') {
            const hash = msg.text
            users[chatId] = {
                hash: hash,
                ...users[chatId]
            }
            const newUserData = users[chatId]
            await save(newUserData, msg.from.username)

            // user.updateOne({username: msg.from.username}, {hash: hash, updatedAt: Date.now()}, function (err, res) {
            //     if(err) {
            //         console.log(err)
            //     } else {
            //         console.log('User updated', res)
            //     }
            // })
            stage[chatId] = null
            emailInput[chatId] = true
            done[chatId] = false
            const message = lang[chatId] ? `Your wallet will be included in Whitelist within 24 hours. Insert your email (just in case)` : `Спасибо! Перевод будет проверен. После проверки, Ваш кошелек появится в Whitelist в течение 24 часов. Оставьте ваш email для связи и решения возможных проблем`

            await bot.sendMessage(chatId, message)
        } else if (!msg.text.toString().includes('0x') && stage[chatId] === 'wallet_input') {
            const msg = lang[chatId] ? `Invalid address. Enter the address again` : `Введен некорректный адрес кошелька. Введите адрес еще раз`
            await bot.sendMessage(chatId, msg)
        } else if (msg.text.toString().replace(/\s/g, '').length === 16 && stage[chatId] === 'card_input') {
            const card = msg.text
            users[chatId] = {
                card: card,
                ...users[chatId]
            }
            stage[chatId] = 'wallet_input'
            done[chatId] = true
            const message = `Укажите ваш кошелек в сети BSC для занесения его в Whitelist и зачисления токенов $MEDOS`
            await bot.sendMessage(chatId, message)    

        } else if (Number(msg.text) > 0 && userToken[chatId] && userChain[chatId] && !msg.text.toString().includes('0x')) {
            const userAmount = Number(msg.text)
            if (userChain[chatId] === 'btc') {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                const amountToSend = (1/priceUSD * userAmount).toFixed(6)
                const address = wallets.wallets.btc[0]
                users[chatId] = {
                    amountUSD: userAmount,
                    amountToSend,
                    priceUSD,
                    symbol,
                    ...users[chatId]
                }
                const message = lang[chatId] ? `Send ${Number(amountToSend)} ${tokenSymbols[symbol]} on address ${address} then click "Done"` : `Переведите ${Number(amountToSend)} ${tokenSymbols[symbol]} на данный кошелек: ${address}, затем кликните "Готово"`
                const options = lang[chatId] ? doneOptionsEN : doneOptionsRU
                await bot.sendMessage(chatId, message, options)
            } else if (userToken[chatId] === 'fiat') {
                const priceUSD = await getRubPrice()
                const amountToSend = parseInt(userAmount * priceUSD * 1.1)
                const card = wallets.wallets.fiat[0]
                users[chatId] = {
                    amountUSD: userAmount,
                    symbol: 'fiat',
                    amountToSend,
                    priceUSD,
                    ...users[chatId]
                }
                await bot.sendMessage(chatId, `Отправьте ${amountToSend} рублей на карту ${card} затем нажмите "Готово"`, doneOptionsRU)
            } else {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                let amountToSend = (1/priceUSD * userAmount).toFixed(6)
                if (['usd-coin', 'dai', 'tether', 'binance-usd'].includes(userToken[chatId])) {
                    amountToSend = amountToSend < userAmount ? userAmount : Number(amountToSend).toFixed(2)
                }
                users[chatId] = {
                    amountUSD: userAmount,
                    amountToSend,
                    priceUSD,
                    symbol,
                    ...users[chatId]
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
            if (users[chatId].symbol !== 'fiat') {
                stage[chatId] = 'hash_input'
                const message = lang[chatId] ? `Enter the transaction hash to confirm the transfer` : `Введите хэш транзакции для подтверждения перевода`
                await bot.sendMessage(chatId, message)    
            } else {
                stage[chatId] = null
                emailInput[chatId] = true
                done[chatId] = false
                const message = lang[chatId] ? `Your wallet will be included in Whitelist within 24 hours. Insert your email (just in case)` : `Спасибо! Перевод будет проверен. После проверки, Ваш кошелек появится в Whitelist в течение 24 часов. Оставьте ваш email для связи и решения возможных проблем`
                await bot.sendMessage(chatId, message)    
            }
        } else if (emailInput[chatId]) {
            emailInput[chatId] = false
            const email = msg.text
            users[chatId] = {
                email,
                ...users[chatId]
            }
            await saveEmail(email, msg.from.username)
            const message = lang[chatId] ? `Make sure you subscribed to our Telegram channel so you don't miss any breaking news: https://t.me/metademos_news` : `Убедитесь, что подписаны на наш Telegram канал, чтобы не пропустить срочные новости https://t.me/MetaDemosFun`
            const options = lang[chatId] ? againOptionsEN : againOptionsRU
            await bot.sendMessage(chatId, message, options)
        } else if (checkUser[chatId]) {
            checkUser[chatId] = false
            const usersData = await user.find({})
            const newUsersData = usersData.filter(item => item.address === msg.text)
            const usdAmount = newUsersData.reduce((acc, item) => {
                return acc + item.amountUSD
            }, 0)
            if (usdAmount) {
                const message = lang[chatId] ? `Wallet ${msg.text} is on the white list. Invested amount ${usdAmount} USD` : `Кошелек ${msg.text} в белом списке. Инвестированная сумма ${usdAmount} USD`
                const options = lang[chatId] ? checkUserOptionsEN : checkUserOptionsRU
                await bot.sendMessage(chatId, message, options)
            } else {
                const message = lang[chatId] ? `Wallet ${msg.text} is not on the white list.` : `Кошелек ${msg.text} не в белом списке`
                const options = lang[chatId] ? checkUserOptionsEN : checkUserOptionsRU
                await bot.sendMessage(chatId, message, options)
            }
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
            emailInput[chatId] = null
            checkUser[chatId] = null
            stage[chatId] = null
            const options = lang[chatId] ? mainOptionsEN : mainOptionsRU
            await bot.sendMessage(chatId, helloMsg[lang[chatId]], options)
        }
        else if (data === 'ru' || data === 'en') {
            lang[chatId] = data === 'ru' ? 0 : 1
            const options = lang[chatId] ? mainOptionsEN : mainOptionsRU
            await bot.sendMessage(chatId, helloMsg[lang[chatId]], options)
        }
        else if (data === 'private_round') {
            userToken[chatId] = ''
            userChain[chatId] = ''
            users[chatId] = {}
            done[chatId] = false
            emailInput[chatId] = null
            checkUser[chatId] = null
            stage[chatId] = null
            const options = lang[chatId] ? privateRoundOptionsEN : privateRoundOptionsRU
            const message = lang[chatId] ? 'Participate in a private token sale round' :'Участвовать в приватном раунде продажи токенов'
            await bot.sendMessage(chatId, message, options)
        }
        else if (data === 'buy') {
            userToken[chatId] = ''
            userChain[chatId] = ''
            users[chatId] = {}
            done[chatId] = false
            emailInput[chatId] = null
            checkUser[chatId] = null
            stage[chatId] = null
            const options = lang[chatId] ? tokenOptionsEN : tokenOptionsRU
            await bot.sendMessage(chatId, tokenMsg[lang[chatId]], options)
        }

        else if (tokens.includes(data)) {
            if (data === 'bitcoin') {
                userToken[chatId] = 'bitcoin'
                userChain[chatId] = 'btc'
                const options = lang[chatId] ? amountOptionsEN : amountOptionsRU
                await bot.sendMessage(chatId, amountMsg[lang[chatId]], options)
            } else {
                userToken[chatId] = data
                await bot.sendMessage(chatId, chainMsg[lang[chatId]], chainOptions)
            }
        }
        else if(Number(data) > 0) {
            const userAmount = Number(data)
            if (userChain[chatId] === 'btc') {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                const amountToSend = (1/priceUSD * data).toFixed(6)
                const address = wallets.wallets.btc[0]
                users[chatId] = {
                    amountUSD: userAmount,
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
                    amountUSD: userAmount,
                    symbol: 'fiat',
                    amountToSend,
                    priceUSD,
                    ...users[chatId]
                }
                await bot.sendMessage(chatId, `Отправьте ${amountToSend} рублей на карту ${card} затем нажмите "Готово"`, doneOptionsRU)
            } else {
                const [priceUSD, symbol] = await getTokenUSDPrice(userToken[chatId])
                let amountToSend = (1/priceUSD * data).toFixed(6)
                if (['usd-coin', 'dai', 'tether', 'binance-usd'].includes(userToken[chatId])) {
                    amountToSend = amountToSend < Number(data) ? data : Number(amountToSend).toFixed(2)
                }
                users[chatId] = {
                    amountUSD: userAmount,
                    amountToSend,
                    priceUSD,
                    symbol,
                    ...users[chatId]
                }
                const message = lang[chatId] ? `Send ${Number(amountToSend)} ${tokenSymbols[symbol]} on address ${wallets.wallets[userChain[chatId]][0]} then click "Done"` : `Переведите ${Number(amountToSend)} ${tokenSymbols[symbol]} на данный кошелек: ${wallets.wallets[userChain[chatId]][0]}, затем кликните "Готово"`
                const options = lang[chatId] ? doneOptionsEN : doneOptionsRU

                await bot.sendMessage(chatId, message, options)
            }
        }
        else if(chains.includes(data)) {
            userChain[chatId] = data
            const options = lang[chatId] ? amountOptionsEN : amountOptionsRU
            await bot.sendMessage(chatId, amountMsg[lang[chatId]], options)
        }
        else if (data === 'fiat') {
            userChain[chatId] = data
            userToken[chatId] = data
            await bot.sendMessage(chatId, amountMsg[lang[chatId]], amountOptionsRU)
        }
        else if (data === 'whitelist') {
            const options = lang[chatId] ? whiteListOptionsEN : whiteListOptionsRU
            const message = lang[chatId] ? `Here you can check if your wallet is whitelisted` : `Тут вы можете проверить находится ли ваш кошелек в вайтлисте`
            await bot.sendMessage(chatId, message, options)
        }
        else if (data === 'check_wallet') {
            checkUser[chatId] = true
            const message = lang[chatId] ? 'Enter a wallet address that you want to check for the whitelist' : 'Укажите адрес кошелька который нужно проверить на наличие в списке'
            await bot.sendMessage(chatId, message)
        }
        else if (data === 'details') {
            const options = lang[chatId] ? detailsOptionsEN : detailsOptionsRU
            await bot.sendMessage(chatId, detailsMsg[lang[chatId]], options)
        }
        else if (data === 'done') {
            if (userToken[chatId] === 'fiat') {
                stage[chatId] = 'card_input'
                await bot.sendMessage(chatId, 'Укажите номер вашей карты для проверки перевода')
            } else {
                stage[chatId] = 'wallet_input'
                done[chatId] = true
                const msg = lang[chatId] ? `Insert your BSC wallet address to be added to the Whitelist and receive $MEDOS tokens` : `Укажите ваш кошелек в сети BSC для занесения его в Whitelist и зачисления токенов $MEDOS`
                await bot.sendMessage(chatId, msg)    
            }
        }
    })
}

main()