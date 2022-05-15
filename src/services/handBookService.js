import db from '../models/index';
require('dotenv').config();

let getAllHandBook = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Hand_books.findAll();
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

let getTopHandBook = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Hand_books.findAll({
        limit: limit,
        raw: true,
        nest: true,
      });
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = Buffer.from(item.image, 'base64').toString('binary');
          return item;
        });
      }

      resolve({
        errCode: 0,
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let createNewHandBook = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkHandBookName(data.name);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage:
            'Your name is already in used, Please try another name!!!',
        });
      }
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 2,
          errMessage: 'Missing required parameter !',
        });
      } else {
        await db.Hand_books.create({
          name: data.name,
          image: data.imageBase64,
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

let checkHandBookName = (handBookName) => {
  return new Promise(async (resolve, reject) => {
    try {
      let name = await db.Hand_books.findOne({
        where: { name: handBookName },
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

let getDetailHandBookById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: 'Missing required parameter !',
        });
      } else {
        let data = await db.Hand_books.findOne({
          where: {
            id: inputId,
          },
          attributes: [
            'name',
            'image',
            'descriptionHTML',
            'descriptionMarkdown',
          ],
        });
        if (data && data.length > 0) {
          data.map((item) => {
            item.image = Buffer.from(item.image, 'base64').toString('binary');
            return item;
          });
        }

        resolve({
          errCode: 0,
          errMessage: 'OK',
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateHandBookData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 2,
          errMessage: 'Missing required parameters',
        });
      }
      let handBook = await db.Hand_books.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (handBook) {
        handBook.name = data.name;
        handBook.descriptionHTML = data.descriptionHTML;
        handBook.descriptionMarkdown = data.descriptionMarkdown;
        if (data.image) {
          handBook.image = data.image;
        }
        await handBook.save();
        resolve({
          errCode: 0,
          message: 'Update the hand book success !',
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: `Hand book's not found !`,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteHandBook = (handBookId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Hand_books.findOne({
        where: {
          id: handBookId,
        },
      });
      if (!data) {
        resolve({
          errCode: 2,
          message: `The hand book isn't exits`,
        });
      }
      await db.Hand_books.destroy({
        where: {
          id: handBookId,
        },
      });

      resolve({
        errCode: 0,
        message: `The hand book is delete`,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getAllHandBook: getAllHandBook,
  getTopHandBook: getTopHandBook,
  getDetailHandBookById: getDetailHandBookById,
  createNewHandBook: createNewHandBook,
  updateHandBookData: updateHandBookData,
  deleteHandBook: deleteHandBook,
};
