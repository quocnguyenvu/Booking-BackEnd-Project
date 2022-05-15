import handBookService from '../services/handBookService';

let getAllHandBook = async (req, res) => {
  try {
    let response = await handBookService.getAllHandBook();
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getTopHandBook = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 2;
  try {
    let response = await handBookService.getTopHandBook(+limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let createNewHandBook = async (req, res) => {
  try {
    let response = await handBookService.createNewHandBook(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let getDetailHandBookById = async (req, res) => {
  try {
    let response = await handBookService.getDetailHandBookById(req.query.id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let handleEditHandBook = async (req, res) => {
  try {
    let response = await handBookService.updateHandBookData(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

let handleDeleteHandBook = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(200).json({
        errCode: 1,
        errMessage: 'Missing required parameters !!!',
      });
    }
    let response = await handBookService.deleteHandBook(req.body.id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from the server !',
    });
  }
};

module.exports = {
  createNewHandBook: createNewHandBook,
  getAllHandBook: getAllHandBook,
  getDetailHandBookById: getDetailHandBookById,
  handleDeleteHandBook: handleDeleteHandBook,
  handleEditHandBook: handleEditHandBook,
  getTopHandBook: getTopHandBook,
};
