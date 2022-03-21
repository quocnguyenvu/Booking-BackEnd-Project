'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Patient.belongsTo(models.Allcode, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderIdData' })

      // 1 patient n booking
      Patient.hasMany(models.Booking, { foreignKey: 'patientId', as: 'patientIdData' })

    }
  };
  Patient.init({
    email: DataTypes.STRING,
    fullName: DataTypes.STRING,
    address: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    gender: DataTypes.STRING,
    roleId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};