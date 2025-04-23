const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  generatedId: {
    type: String,
    unique: true,
    required: true,
  },
  referalCode: {
    type: String,
  },
  deposit: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  totalDeposit: {
    type: Number,
    default: 0
  },
  totalInvest: {
    type: Number,
    default: 0
  },
  totalWithdraw: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  level1Commission: {
    type: Number,
    default: 0
  },
  level2Commission: {
    type: Number,
    default: 0
  },
  level3Commission: {
    type: Number,
    default: 0
  },
  profileImage: {
    type: String,
  },
  ban: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Register = mongoose.model('Register', registerSchema);

module.exports = Register;
