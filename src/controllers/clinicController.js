import clinicService from '../services/clinicService';

let createNewClinic = async (req, res) => {
    try {
        let infor = await clinicService.createNewClinic(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server !'
        })
    }
}

let getAllClinic = async (req, res) => {
    try {
        let infor = await clinicService.getAllClinic();
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server !'
        })
    }
}

let getDetailClinicById = async (req, res) => {
    try {
        let infor = await clinicService.getDetailClinicById(req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server !'
        })
    }
}

let handleEditClinic = async (req, res) => {
    let message = await clinicService.updateClinicData(req.body);
    return res.status(200).json(message)
}
let handleDeleteClinic = async (req, res) => {
    if(!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters !!!'
        })
    }
    let message = await clinicService.deleteClinic(req.body.id);
    return res.status(200).json(message); 
}

module.exports = {
    createNewClinic: createNewClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
    handleEditClinic: handleEditClinic,
    handleDeleteClinic: handleDeleteClinic
}