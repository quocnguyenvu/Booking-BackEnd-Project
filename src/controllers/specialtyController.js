import specialtyService from '../services/specialtyService';

let getAllSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.getAllSpecialty();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getTopSpecialty = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 4;
  try {
    let response = await specialtyService.getTopSpecialty(+limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let createNewSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.createNewSpecialty(req.body);
    return res.status(201).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getDetailSpecialtyById = async (req, res) => {
  try {
    let response = await specialtyService.getDetailSpecialtyById(
      req.query.id,
      req.query.location
    );
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let handleEditSpecialty = async (req, res) => {
  try {
    let response = await specialtyService.updateSpecialtyData(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let handleDeleteSpecialty = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(204).json({
        errCode: 1,
        errMessage: 'Missing required parameters !!!',
      });
    }
    let message = await specialtyService.deleteSpecialty(req.body.id);
    return res.status(200).json(message);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

module.exports = {
  createNewSpecialty: createNewSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
  handleDeleteSpecialty: handleDeleteSpecialty,
  handleEditSpecialty: handleEditSpecialty,
  getTopSpecialty: getTopSpecialty,
};
