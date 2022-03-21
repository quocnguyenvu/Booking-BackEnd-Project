import patientService from '../services/patientService';



let getAllPatient = async (req, res) => {
    try {
        let patients = await patientService.getAllPatient();
        return res.status(200).json(patients);
    } catch(e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server !'
        })
    }
}

let postBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postBookAppointment(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server !'
        })
    }
}

let postVerifyBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postVerifyBookAppointment(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server !'
        })
    }
}

module.exports = {
    getAllPatient: getAllPatient,
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,

}