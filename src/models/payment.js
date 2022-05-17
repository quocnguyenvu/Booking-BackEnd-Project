'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init(
    {
      paymentId: DataTypes.STRING,
      email: DataTypes.STRING,
      email_address: DataTypes.STRING,
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      value: DataTypes.STRING,
      currency_code: DataTypes.STRING,
      doctorId: DataTypes.INTEGER,
      timeType: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Payment',
    }
  );
  return Payment;
};
