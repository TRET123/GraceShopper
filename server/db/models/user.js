const crypto = require('crypto')
const Sequelize = require('sequelize')
const db = require('../db')

const User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address'
      }
    }
  },

  password: {
    type: Sequelize.STRING,
    validate: {
      len: {
        args: [4],
        msg: 'Password must be more than 4 characters'
      }
    },

    get() {
      return () => this.getDataValue('password')
    }
  },

  imgUrl: {
    type: Sequelize.STRING
  },

  salt: {
    type: Sequelize.STRING,
    get() {
      return () => this.getDataValue('salt')
    }
  },

  googleId: {
    type: Sequelize.STRING
  },

  firstName: {
    type: Sequelize.STRING
  },

  lastName: {
    type: Sequelize.STRING
  },

  address: {
    type: Sequelize.TEXT
  },

  admin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
})

module.exports = User

User.prototype.correctPassword = function(candidatePwd) {
  return User.encryptPassword(candidatePwd, this.salt()) === this.password()
}

User.generateSalt = function() {
  return crypto.randomBytes(16).toString('base64')
}

User.encryptPassword = function(plainText, salt) {
  return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex')
}

const setSaltAndPassword = user => {
  if (user.changed('password')) {
    user.salt = User.generateSalt()
    user.password = User.encryptPassword(user.password(), user.salt())
  }
}

User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)

User.beforeBulkCreate(users => {
  users.forEach(setSaltAndPassword)
})
