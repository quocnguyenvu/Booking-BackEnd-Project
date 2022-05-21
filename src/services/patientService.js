import db from '../models/index';
require('dotenv').config();
import { v4 as uuidv4 } from 'uuid';
import emailService from './emailService';

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify/booking?token=${token}&doctorId=${doctorId}`;
  return result;
};

let getAllPatient = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let patients = await db.Patient.findAll();
      resolve({
        errCode: 0,
        data: patients,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.date ||
        !data.timeType ||
        !data.fullName ||
        !data.selectedGenders ||
        !data.address ||
        !data.phoneNumber
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let token = uuidv4();

        await emailService.sendSimpleEmail({
          reciverEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorId, token),
        });

        // insert patient
        let user = await db.Patient.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: 'R3',
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            address: data.address,
            gender: data.selectedGenders,
          },
        });
        // create a booking
        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: {
              patientId: user[0].id,
            },
            defaults: {
              statusId: 'S1',
              doctorId: data.doctorId,
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token,
              statusPayment: 'Unpaid',
            },
          });
        }

        resolve({
          errCode: 0,
          errMessage: 'Save infor patient success !',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: 'S1',
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = 'S2';
          await appointment.save();

          resolve({
            errCode: 0,
            errMessage: 'Update the appointment success !',
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: 'Appointment has been activated or dose not exist !',
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let patientPayment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkPaymentId(data.paymentId);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: 'PaymentId is duplicatedd!!!',
        });
      } else if (
        !data.fullName ||
        !data.email ||
        !data.value ||
        !data.address ||
        !data.timeType ||
        !data.paymentId ||
        !data.email_address ||
        !data.currency_code ||
        !data.doctorId
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        await db.Payment.create({
          fullName: data.fullName,
          email: data.email,
          value: data.value,
          address: data.address,
          doctorId: data.doctorId,
          timeType: data.timeType,
          paymentId: data.paymentId,
          email_address: data.email_address,
          currency_code: data.currency_code,
        });

        resolve({
          errCode: 0,
          errMessage: 'Payment success!!!',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let checkPaymentId = (paymentId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Payment.findOne({
        where: { paymentId: paymentId },
      });
      if (data) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllPatientPayment = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Payment.findAll();
      resolve({
        errCode: 0,
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let postPaymentPatient = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.date ||
        !data.timeType ||
        !data.fullName ||
        !data.selectedGenders ||
        !data.address ||
        !data.phoneNumber ||
        !data.paymentId ||
        !data.email_address ||
        !data.value ||
        !data.currency_code
      ) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        await emailService.sendPaymentPatient({
          paymentId: data.paymentId,
          email: data.email,
          fullName: data.fullName,
          value: data.value,
          currency_code: data.currency_code,
          doctorName: data.doctorName,
          time: data.timeString,
          language: data.language,
        });

        // insert patient
        let user = await db.Patient.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: 'R3',
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            address: data.address,
            gender: data.selectedGenders,
          },
        });
        // create a booking
        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: {
              patientId: user[0].id,
            },
            defaults: {
              statusId: 'S2',
              doctorId: data.doctorId,
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              statusPayment: 'Paid',
            },
          });
        }

        // insert payment
        await db.Payment.findOrCreate({
          where: { paymentId: data.paymentId },
          defaults: {
            paymentId: data.paymentId,
            patientId: user[0].id,
            email: data.email,
            email_address: data.email_address,
            fullName: data.fullName,
            address: data.address,
            value: data.value,
            currency_code: data.currency_code,
            doctorId: data.doctorId,
            timeType: data.timeType,
          },
        });

        resolve({
          errCode: 0,
          errMessage: 'Save infor patient success !',
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  patientPayment: patientPayment,
  getAllPatient: getAllPatient,
  postBookAppointment: postBookAppointment,
  getAllPatientPayment: getAllPatientPayment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  postPaymentPatient: postPaymentPatient,
};
