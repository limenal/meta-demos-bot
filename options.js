module.exports = {
    mainOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💰 Private Round', callback_data: 'private_round'}],
                [{text: '🌐 Website', callback_data: 'website'}],
                [{text: '🗒 Whitelist', callback_data: 'whitelist'}],
                [{text: '❓ Задать вопрос', callback_data: 'support'}]
            ]
        })
    },
    mainOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💰 Private Round', callback_data: 'private_round'}],
                [{text: '🌐 Website', callback_data: 'website'}],
                [{text: '🗒 Whitelist', callback_data: 'whitelist'}],
                [{text: '❓ Support', callback_data: 'support'}]
            ]
        })
    },
    privateRoundOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💳 Купить', callback_data: 'buy'}],
                [{text: '📖 Подробнее', callback_data: 'details'}]
            ]
        })
    },
    privateRoundOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💳 Buy', callback_data: 'buy'}],
                [{text: '📖 Details', callback_data: 'details'}]
            ]
        })
    },
    amountOptions: {
       reply_markup: JSON.stringify({
           inline_keyboard: [
               [{text: '50💲', callback_data: '50'}],
               [{text: '100💲', callback_data: '100'}],
               [{text: '500💲', callback_data: '500'}],
               [{text: '1000💲', callback_data: '1000'}]
           ]
       })
   },
   tokenOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'BTC', callback_data: 'bitcoin'}],
                [{text: 'USDT', callback_data: 'tether'}],
                [{text: 'DAI', callback_data: 'dai'}],
                [{text: 'USDC', callback_data: 'usd-coin'}],
                [{text: 'BUSD', callback_data: 'busd'}],
                [{text: 'ETH', callback_data: 'ethereum'}],
                [{text: '💳 Карты Visa / Mastercard / Мир', callback_data: 'fiat'}]
            ]
        })
    },
    tokenOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'BTC', callback_data: 'bitcoin'}],
                [{text: 'USDT', callback_data: 'tether'}],
                [{text: 'DAI', callback_data: 'dai'}],
                [{text: 'USDC', callback_data: 'usd-coin'}],
                [{text: 'BUSD', callback_data: 'busd'}],
                [{text: 'ETH', callback_data: 'ethereum'}],
            ]
        })
    },
    chainOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Ethereum (ERC-20)', callback_data: 'eth'}],
                [{text: 'Binance Smart Chain (BEP-20)', callback_data: 'binance'}],
                [{text: 'Tron (TRC-20)', callback_data: 'tron'}],
                [{text: 'Polygon', callback_data: 'polygon'}],
            ]
        })
    },
    languageOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'English', callback_data: 'en'}, {text: 'Русский', callback_data: 'ru'}]
            ]
        })
    },
    doneOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: ' Оплатил✅ ', callback_data: 'done'}]
            ]
        })
    },
    doneOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: ' Done ✅ ', callback_data: 'done'}]
            ]
        })
    },
    againOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Go to main menu', callback_data: 'start_again'}]
            ]
        })
    },
    

}