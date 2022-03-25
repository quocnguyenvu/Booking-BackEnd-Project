const db = require('../models');

require('dotenv').config();

let createNewSpecialty = (data) => {
    return new Promise ( async (resolve, reject) => {
        try {
            let check = await checkSpecialtyName(data.name);
            if(check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your name is already in used, Please try another name!!!'
                });
            }if(
                !data.name || 
                !data.imageBase64 ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameter !',
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                })
            }
        } catch(e) {
            reject(e)
        }
    })
}

let checkSpecialtyName = (specialtyName) => {
    return new Promise( async (resolve, reject) => {
        try {
            let name = await db.Specialty.findOne({
               where: { name: specialtyName } 
            });
            if(name) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch(e) {
            reject(e);
        }
    })
}

let getAllSpecialty = () => {
    return new Promise ( async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll();
            if(data && data.length > 0) {
                data.map((item)  => {
                    item.image = Buffer.from(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'OK',
                data
            })
        } catch (e) {
            reject(e)
        }
    })
}

let getDetailSpecialtyById = (inputId, location) => {
    return new Promise ( async (resolve, reject) => {
        try {
            if(!inputId || !location) { 
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !',
                })
            } else {
                let data = await db.Specialty.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown']
                })

                if(data){
                    let doctorSpecialty = [];
                    if(location === 'ALL') {
                        doctorSpecialty = await db.Doctor_infor.findAll({
                            where: {
                                specialtyId: inputId,
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        // find by location
                        doctorSpecialty = await db.Doctor_infor.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }
                    
                    data.doctorSpecialty = doctorSpecialty;

                } else data = {}

                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let updateSpecialtyData = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            if(!data.id) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                });
            }
            let specialty = await db.Specialty.findOne({
                where: { id: data.id },
                raw: false
            });
            if(specialty) {
                specialty.name = data.name;
                specialty.descriptionHTML = data.descriptionHTML;
                specialty.descriptionMarkdown = data.descriptionMarkdown;
                if(data.image) {
                    specialty.image = data.image;
                }
                await specialty.save();
                resolve({
                    errCode: 0,
                    message: 'Update the specialty success !'
                });
            }else {
                resolve({
                    errCode: 1,
                    errMessage: `Specialty's mot found !`
                });
            }
        }
        catch(e) {
            reject(e);
        }
    })
}

let deleteSpecialty = (specialtyId) => {
    return new Promise ( async (resolve, reject) => {
        let specialty = await db.Specialty.findOne({
            where: { 
                id: specialtyId
            }
        });
        if(!specialty) {
            resolve({
                errCode: 2,
                message: `The specialty isn't exits`
            })
        }
        await db.Specialty.destroy({
            where: { 
                id: specialtyId
            }
        });

        resolve({
            errCode: 0,
            message: `The specialty is delete`
        })
    });
}

module.exports = {
    createNewSpecialty: createNewSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    deleteSpecialty: deleteSpecialty,
    updateSpecialtyData: updateSpecialtyData
}