import mongoose from 'mongoose';

const url = 'mongodb+srv://admin:U1JHt49s1Q4fANTy@cluster0.4adfe.mongodb.net/deteconan?retryWrites=true&w=majority';

mongoose.connect(url, { useNewUrlParser: true }, err => {
    if (err) {
        console.error(err);
        throw err;
    }
    else
        console.log('mongo connected');
});
