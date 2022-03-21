'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 1 user - n allcode
      User.belongsTo(models.Allcode, { foreignKey: 'positionId', targetKey: 'keyMap', as: 'positionData' })
      User.belongsTo(models.Allcode, { foreignKey: 'gender', targetKey: 'keyMap', as: 'genderData' })

      // 1 user - 1 markdown
      User.hasOne(models.Markdown, { foreignKey: 'doctorId' })
      // 1 user - 1 doctor_infor
      User.hasOne(models.Doctor_Infor, { foreignKey: 'doctorId' })

      // 1 user n schedule
      User.hasMany(models.Schedule, { foreignKey: 'doctorId', as: 'doctorIdData' })
    }
  };
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    address: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    gender: DataTypes.STRING,
    image: DataTypes.STRING,
    roleId: DataTypes.STRING,
    positionId: DataTypes.STRING,
    }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};