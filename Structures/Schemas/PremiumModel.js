const mongoose = require("mongoose");

const reqString = {
    type: String,
    required: true,
}

const noReqString = {
    type: String,
    required: false,
}

const PremiumSchema = new mongoose.Schema({
    GuildID: reqString,
    GuildName: noReqString,
    Redeemed: Boolean
});

const PremiumModel = mongoose.model('PremiumModel', PremiumSchema);

module.exports = PremiumModel;