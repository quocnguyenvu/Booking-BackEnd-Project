import db from '../models/index';
require('dotenv').config();
import _ from 'lodash';
import {
  sendAttachment,
  sendSimpleEmail,
  sendLink,
  sendNotificationBlocked,
} from '../services/emailService';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limit,
        where: { roleId: 'R2' },
        order: [['createdAt', 'DESC']],
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: db.Allcode,
            as: 'positionData',
            attributes: ['valueEn', 'valueVi'],
          },
          {
            model: db.Allcode,
            as: 'genderData',
            attributes: ['valueEn', 'valueVi'],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: 'R2' },
        attributes: {
          exclude: ['password'],
        },
      });

      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let checkRequiredFaild = (data) => {
  let arrFailed = [
    'doctorId',
    'contentHTML',
    'contentMarkdown',
    'action',
    'selectedPrice',
    'selectedPayment',
    'selectedProvince',
    'nameClinic',
    'addressClinic',
    'note',
    'specialtyId',
  ];
  let isValid = true;
  let element = '';
  for (let i = 0; i < arrFailed.length; i++) {
    if (!data[arrFailed[i]]) {
      isValid = false;
      element = arrFailed[i];
      break;
    }
  }

  return {
    isValid: isValid,
    element: element,
  };
};

let saveDetailInforDoctor = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObject = checkRequiredFaild(data);
      let check = await db.Doctor_infor.findOne({
        where: { doctorId: data.doctorId },
        raw: false,
      });

      if (checkObject.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${checkObject.element}`,
        });
      } else {
        // Insert to Markdown
        if (data.action === 'CREATE' && !check) {
          await db.Markdown.create({
            contentHTML: data.contentHTML,
            contentMarkdown: data.contentMarkdown,
            description: data.description,
            doctorId: data.doctorId,
          });
        } else if (data.action === 'EDIT') {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: data.doctorId },
            raw: false,
          });

          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = data.contentHTML;
            doctorMarkdown.contentMarkdown = data.contentMarkdown;
            doctorMarkdown.description = data.description;
            await doctorMarkdown.save();
          }
        }

        // Insert to Doctor_infor
        let doctorInfor = await db.Doctor_infor.findOne({
          where: {
            doctorId: data.doctorId,
          },
          raw: false,
        });

        if (doctorInfor) {
          // update
          doctorInfor.note = data.note;
          doctorInfor.doctorId = data.doctorId;
          doctorInfor.priceId = data.selectedPrice;
          doctorInfor.nameClinic = data.nameClinic;
          doctorInfor.specialtyId = data.specialtyId;
          doctorInfor.paymentId = data.selectedPayment;
          doctorInfor.provinceId = data.selectedProvince;
          doctorInfor.addressClinic = data.addressClinic;
          await doctorInfor.save();
        } else {
          // create
          await db.Doctor_infor.create({
            note: data.note,
            doctorId: data.doctorId,
            nameClinic: data.nameClinic,
            priceId: data.selectedPrice,
            specialtyId: data.specialtyId,
            paymentId: data.selectedPayment,
            addressClinic: data.addressClinic,
            provinceId: data.selectedProvince,
          });
        }

        resolve({
          errCode: 0,
          errMessage: 'Save infor doctor success !',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ['password'],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown'],
            },
            {
              model: db.Doctor_infor,
              attributes: {
                exclude: ['id', 'doctorId'],
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceIdData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'paymentIdData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'provinceIdData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
            {
              model: db.Allcode,
              as: 'positionData',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = Buffer.from(data.image, 'base64').toString('binary');
        }

        if (!data) data = {};

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item;
          });
        }
        // get all existing data
        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: '' + data.formatedDate },
          attributes: ['date', 'timeType', 'doctorId', 'maxNumber'],
          raw: true,
        });

        //convert date
        // if (existing && existing.length > 0) {
        //   existing = existing.map((item) => {
        //     item.date = new Date(item.date).getTime();
        //     return item;
        //   });
        // }

        // compare different
        let toCreate = _.differenceWith(schedule, existing, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });

        //  create data
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }

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

let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.Allcode,
              as: 'timeTypeData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.User,
              as: 'doctorIdData',
              attributes: ['firstName', 'lastName'],
            },
          ],
          raw: false,
          nest: true,
        });
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getExtraInforDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.Doctor_infor.findOne({
          where: {
            doctorId: doctorId,
          },
          attributes: {
            exclude: ['id', 'doctorId'],
          },
          include: [
            {
              model: db.Allcode,
              as: 'priceIdData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Allcode,
              as: 'paymentIdData',
              attributes: ['valueEn', 'valueVi'],
            },
            {
              model: db.Allcode,
              as: 'provinceIdData',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getProfileDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ['password'],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ['description', 'contentHTML', 'contentMarkdown'],
            },
            {
              model: db.Doctor_infor,
              attributes: {
                exclude: ['id', 'doctorId'],
              },
              include: [
                {
                  model: db.Allcode,
                  as: 'priceIdData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'paymentIdData',
                  attributes: ['valueEn', 'valueVi'],
                },
                {
                  model: db.Allcode,
                  as: 'provinceIdData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
            {
              model: db.Allcode,
              as: 'positionData',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = Buffer.from(data.image, 'base64').toString('binary');
        }

        if (!data) data = {};

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: 'S2',
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.Patient,
              as: 'patientIdData',
              attributes: [
                'email',
                'fullName',
                'phoneNumber',
                'address',
                'gender',
              ],
              include: [
                {
                  model: db.Allcode,
                  as: 'genderIdData',
                  attributes: ['valueEn', 'valueVi'],
                },
              ],
            },
            {
              model: db.Allcode,
              as: 'timeTypeDataPatient',
              attributes: ['valueEn', 'valueVi'],
            },
          ],
          raw: false,
          nest: true,
        });

        // if(!data) data = {};

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.patientId ||
        !data.timeType ||
        !data.diagnose
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        // Update patient status
        let appointment = await db.Booking.findOne({
          where: {
            patientId: data.patientId,
            // email: data.email,
            doctorId: data.doctorId,
            timeType: data.timeType,
            statusId: 'S2',
          },
          raw: false,
        });

        if (appointment) {
          await db.History.create({
            patientId: appointment.patientId,
            email: data.email,
            doctorId: appointment.doctorId,
            timeType: appointment.timeType,
            diagnose: data.diagnose,
            statusId: 'S3',
          });

          await appointment.destroy();
          // Send email remedy
          await sendAttachment(data);
        }

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

let sendOnlineClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        // Update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: 'S2',
          },
          raw: false,
        });

        if (appointment) {
          await appointment.save();
          // Send email remedy
          await sendLink(data);
        }

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

let sendBlockedNotification = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        // Update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: 'S2',
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = 'S4';
          // Send email remedy
          await sendNotificationBlocked(data);
          await db.Block.create({
            patientId: appointment.patientId,
            email: appointment.email,
            doctorId: appointment.doctorId,
            timeType: appointment.timeType,
            statusId: 'S4',
          });
          await appointment.save();
        }

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

let getAllPatientForDoctor = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.History.findAll({
          where: {
            doctorId: doctorId,
          },
          include: [
            {
              model: db.Patient,
              as: 'patientInfor',
              attributes: [
                'email',
                'fullName',
                'phoneNumber',
                'address',
                'gender',
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        // if(!data) data = {};

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getPatientforDoctorById = (patientId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!patientId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.History.findAll({
          where: {
            patientId: patientId,
          },
          include: [
            {
              model: db.Patient,
              as: 'patientInfor',
              attributes: [
                'email',
                'fullName',
                'phoneNumber',
                'address',
                'gender',
              ],
            },
          ],
          raw: false,
          nest: true,
        });
        // if(!data) data = {};

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctor: saveDetailInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
  sendOnlineClinic: sendOnlineClinic,
  sendBlockedNotification: sendBlockedNotification,
  getAllPatientForDoctor: getAllPatientForDoctor,
  getPatientforDoctorById: getPatientforDoctorById,
};
