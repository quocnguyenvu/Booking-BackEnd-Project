'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.Patient, {
        foreignKey: 'patientId',
        targetKey: 'id',
        as: 'patientIdData',
      });
      Booking.belongsTo(models.Allcode, {
        foreignKey: 'timeType',
        targetKey: 'keymap',
        as: 'timeTypeDataPatient',
      });
    }
  }
  Booking.init(
    {
      statusId: DataTypes.STRING,
      doctorId: DataTypes.INTEGER,
      patientId: DataTypes.INTEGER,
      date: DataTypes.STRING,
      timeType: DataTypes.STRING,
      token: DataTypes.STRING,
      statusPayment: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Booking',
    }
  );
  return Booking;
};
