'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Allcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Allcode.hasMany(models.User, {foreignKey: 'positionId', as: 'positonData'})
      Allcode.hasMany(models.User, {foreignKey: 'gender', as: 'genderData'})

      Allcode.hasMany(models.Doctor_Infor, {foreignKey: 'priceId', as: 'priceIdData'})
      Allcode.hasMany(models.Doctor_Infor, {foreignKey: 'paymentId', as: 'paymentIdData'})
      Allcode.hasMany(models.Doctor_Infor, {foreignKey: 'provinceId', as: 'provinceIdData'})

      Allcode.hasMany(models.Patient, {foreignKey: 'gender', as: 'genderIdData'})

      Allcode.hasMany(models.Booking, {foreignKey: 'timeType', as: 'timeTypeDataPatient'})

      Allcode.hasMany(models.Schedule, {foreignKey: 'timeType', as: 'timeTypeIdData'})
    }
  };

  
  Allcode.init({
    keyMap: DataTypes.STRING,
    type: DataTypes.STRING,
    valueEn: DataTypes.STRING,
    valueVi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Allcode',
  });
  return Allcode;
};