import patientService from '../services/patientService';

let getAllPatient = async (req, res) => {
  try {
    let patients = await patientService.getAllPatient();
    return res.status(200).json(patients);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let postBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let postVerifyBookAppointment = async (req, res) => {
  try {
    let infor = await patientService.postVerifyBookAppointment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let patientPayment = async (req, res) => {
  try {
    let infor = await patientService.patientPayment(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getAllPatientPayment = async (req, res) => {
  try {
    let data = await patientService.getAllPatientPayment();
    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let postPaymentPatient = async (req, res) => {
  try {
    let infor = await patientService.postPaymentPatient(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

module.exports = {
  patientPayment: patientPayment,
  getAllPatient: getAllPatient,
  postBookAppointment: postBookAppointment,
  getAllPatientPayment: getAllPatientPayment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  postPaymentPatient: postPaymentPatient,
};
