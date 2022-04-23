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
      let patients = await db.Patient.findAll({
        where: { roleId: 'R3' },
      });

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

module.exports = {
  getAllPatient: getAllPatient,
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
};
