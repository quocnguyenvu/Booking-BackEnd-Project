import clinicService from '../services/clinicService';

let createNewClinic = async (req, res) => {
  try {
    let response = await clinicService.createNewClinic(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getAllClinic = async (req, res) => {
  try {
    let infor = await clinicService.getAllClinic();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getTopClinic = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 4;
  try {
    let response = await clinicService.getTopClinic(+limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getDetailClinicById = async (req, res) => {
  try {
    let response = await clinicService.getDetailClinicById(req.query.id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let handleEditClinic = async (req, res) => {
  try {
    let response = await clinicService.updateClinicData(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let handleDeleteClinic = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(204).json({
        errCode: 1,
        errMessage: 'Missing required parameters !!!',
      });
    }
    let response = await clinicService.deleteClinic(req.body.id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

module.exports = {
  getAllClinic: getAllClinic,
  getTopClinic: getTopClinic,
  getDetailClinicById: getDetailClinicById,
  createNewClinic: createNewClinic,
  handleEditClinic: handleEditClinic,
  handleDeleteClinic: handleDeleteClinic,
};
