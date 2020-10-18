import mongoose from 'mongoose';

const fileAccount = new mongoose.Schema({
    file_id: String,
    account_email: String
});

export default mongoose.model('Files_Accounts', fileAccount);
