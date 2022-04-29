const db = require('../models');

require('dotenv').config();

let createNewClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkName = await checkClinicName(data.name);
      if (checkName === true) {
        resolve({
          errCode: 1,
          errMessage:
            'Your name is already in used, Please try another name!!!',
        });
      }
      if (
        !data.name ||
        !data.address ||
        !data.imageBase64 ||
        !data.specialtyId ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 2,
          errMessage: 'Missing required parameter !',
        });
      } else {
        await db.Clinic.create({
          name: data.name,
          address: data.address,
          image: data.imageBase64,
          specialtyId: data.specialtyId,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkdown: data.descriptionMarkdown,
        });

        resolve({
          errCode: 0,
          errMessage: 'OK',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let checkClinicName = (clinicName) => {
  return new Promise(async (resolve, reject) => {
    try {
      let name = await db.Clinic.findOne({
        where: { name: clinicName },
      });
      if (name) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllClinic = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Clinic.findAll();
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, 'base64').toString('binary');
          return item;
        });
      }
      resolve({
        errCode: 0,
        errMessage: 'OK',
        data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getTopClinic = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let clinic = await db.Clinic.findAll({
        limit: limit,
        raw: true,
        nest: true,
      });

      resolve({
        errCode: 0,
        data: clinic,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailClinicById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.Clinic.findOne({
          where: {
            id: inputId,
          },
          attributes: [
            'name',
            'address',
            'descriptionHTML',
            'descriptionMarkdown',
          ],
        });

        if (data) {
          let specialtyClinic = [];
          specialtyClinic = await db.Specialty.findAll({
            where: {
              clinicId: inputId,
            },
            attributes: ['id', 'name', 'image'],
            raw: false,
            nest: true,
          });

          specialtyClinic.map((item) => {
            return (item.image = Buffer.from(item.image, 'base64').toString(
              'binary'
            ));
          });

          data.specialtyClinic = specialtyClinic;
        } else data = {};

        resolve({
          errCode: 0,
          errMessage: 'OK',
          data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateClinicData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 2,
          errMessage: 'Missing required parameters',
        });
      }
      let clinic = await db.Clinic.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (clinic) {
        clinic.name = data.name;
        clinic.address = data.address;
        clinic.specialtyId = data.specialtyId;
        clinic.descriptionHTML = data.descriptionHTML;
        clinic.descriptionMarkdown = data.descriptionMarkdown;
        if (data.image) {
          clinic.image = data.image;
        }
        await clinic.save();
        resolve({
          errCode: 0,
          message: 'Update the clinic success !',
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: `Clinic's mot found !`,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteClinic = (clinicId) => {
  return new Promise(async (resolve, reject) => {
    let clinic = await db.Clinic.findOne({
      where: {
        id: clinicId,
      },
    });
    if (!clinic) {
      resolve({
        errCode: 2,
        message: `The clinic isn't exits`,
      });
    }
    await db.Clinic.destroy({
      where: {
        id: clinicId,
      },
    });

    resolve({
      errCode: 0,
      message: `The clinic is delete`,
    });
  });
};

module.exports = {
  createNewClinic: createNewClinic,
  getAllClinic: getAllClinic,
  getDetailClinicById: getDetailClinicById,
  updateClinicData: updateClinicData,
  deleteClinic: deleteClinic,
  getTopClinic: getTopClinic,
};
