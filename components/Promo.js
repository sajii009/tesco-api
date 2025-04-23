const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  limit:{
    type: Number,
    required: true
  },
  claimBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      claimedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

const Promo = mongoose.model('Promo', promoSchema);

module.exports = Promo;
