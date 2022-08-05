module.exports = {
    mainOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💰 Участвовать в приватном раунде', callback_data: 'private_round'}],
                [{text: '🌐 Сайт', url:'https://bit.ly/3dbYYAt', callback_data: 'website'}],
                [{text: '🗒 Whitelist', callback_data: 'whitelist'}],
                [{text: '❓ Задать вопрос', url: 'https://t.me/metademos_support', callback_data: 'support'}]
            ]
        })
    },
    mainOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💰 Private Round', callback_data: 'private_round'}],
                [{text: '🌐 Website', url: 'https://bit.ly/3dbYYAt', callback_data: 'website'}],
                [{text: '🗒 Whitelist', callback_data: 'whitelist'}],
                [{text: '❓ Support', url: 'https://t.me/metademos_support', callback_data: 'support'}]
            ]
        })
    },
    privateRoundOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💳 Купить', callback_data: 'buy'}],
                [{text: '📖 Подробнее', callback_data: 'details'}],
                [{text: '↩️ Назад ', callback_data: 'start_again'}]
            ]
        })
    },
    privateRoundOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💳 Buy', callback_data: 'buy'}],
                [{text: '📖 Details', callback_data: 'details'}],
                [{text: '↩️ Back ', callback_data: 'start_again'}]
            ]
        })
    },
    detailsOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💳 Купить', callback_data: 'buy'}],
                [{text: '❓ Задать вопрос', url: 'https://t.me/metademos_support', callback_data: 'support'}],
                [{text: '↩️ Назад ', callback_data: 'private_round'}]
            ]
        })
    },
    detailsOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '💳 Buy', callback_data: 'buy'}],
                [{text: '❓ Support', url: 'https://t.me/metademos_support', callback_data: 'support'}],
                [{text: '↩️ Back ', callback_data: 'private_round'}]
            ]
        })
    },
    amountOptionsRU: {
       reply_markup: JSON.stringify({
           inline_keyboard: [
               [{text: '50💲', callback_data: '50'}],
               [{text: '100💲', callback_data: '100'}],
               [{text: '500💲', callback_data: '500'}],
               [{text: '1000💲', callback_data: '1000'}],
               [{text: '↩️ Назад ', callback_data: 'buy'}]
           ]
       })
   },
   amountOptionsEN: {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: '50💲', callback_data: '50'}],
            [{text: '100💲', callback_data: '100'}],
            [{text: '500💲', callback_data: '500'}],
            [{text: '1000💲', callback_data: '1000'}],
            [{text: '↩️ Back', callback_data: 'buy'}]
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
                [{text: 'BUSD', callback_data: 'binance-usd'}],
                [{text: 'ETH', callback_data: 'ethereum'}],
                [{text: '💳 Карты Visa / Mastercard / Мир', callback_data: 'fiat'}],
                [{text: '↩️ Назад', callback_data: 'private_round'}]
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
                [{text: 'BUSD', callback_data: 'binance-usd'}],
                [{text: 'ETH', callback_data: 'ethereum'}],
                [{text: '↩️ Back', callback_data: 'private_round'}]
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
                [{text: '🇬🇧 English', callback_data: 'en'}, {text: '🇷🇺 Русский', callback_data: 'ru'}]
            ]
        })
    },
    whiteListOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Проверить кошелек на наличие в вайтлисте', callback_data: 'check_wallet'}],
                [{text: '↩️ Назад', callback_data: 'start_again'}]
            ]
        })
    },
    whiteListOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Check a wallet for the whitelist', callback_data: 'check_wallet'}],
                [{text: '↩️ Back', callback_data: 'start_again'}]
            ]
        })
    },
    checkUserOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '❓ Support', url: 'https://t.me/metademos_support', callback_data: 'support'}],
                [{text: '↩️ Back', callback_data: 'whitelist'}]
            ]
        })
    },
    checkUserOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '❓ Помощь', url: 'https://t.me/metademos_support', callback_data: 'support'}],
                [{text: '↩️ Назад', callback_data: 'whitelist'}]
            ]
        })
    },
    doneOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '✅ Готово', callback_data: 'done'}],
                [{text: '🔧 Помощь', url: 'https://t.me/metademos_support', callback_data: 'support'}],
                [{text: '↩️ Назад', callback_data: 'buy'}]
            ]
        })
    },
    doneOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '✅ Done', callback_data: 'done'}],
                [{text: '🔧 Support', url: 'https://t.me/metademos_support', callback_data: 'support'}],
                [{text: '↩️ Back', callback_data: 'buy'}]
            ]
        })
    },
    againOptionsRU: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'В главное меню', callback_data: 'start_again'}]
            ]
        })
    },
    againOptionsEN: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Go to main menu', callback_data: 'start_again'}]
            ]
        })
    }
}