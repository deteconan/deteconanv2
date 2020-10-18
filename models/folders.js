import mongoose from 'mongoose';

const folder = new mongoose.Schema({
    name: String,
    parent_id: String,
});

export default mongoose.model('Folders', folder);
