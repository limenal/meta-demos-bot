const { Schema, model } = require('mongoose')


const user = new Schema({
    address: {type: String},
    email: {type:String},
    chain: {type:String},
    amount: {type: Number},
    priceUSD: {type: Number},
    symbol: {type: String}
})

module.exports = model('User', user)