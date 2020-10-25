import imgur from 'imgur-node-api';
imgur.setClientID('964df2aa43d23c0');

export function sendError(err, req, res, next) {
    console.error(err);
    if (req.headersSent)
        return next(err);
    res.status(HTTP_INTERNAL_ERROR)
        .json({ error: err.message, stack: err.stack.split('\n') });
}

// Return image link
export function uploadImage(url) {
    return new Promise((resolve, reject) => {
        imgur.upload(url, (err, res) => {
            console.log(res);
            if (err) {
                console.error(err);
                reject(err);
            }
            else if (res.data)
                resolve(res.data.link);
            else
                resolve('none');
        });
    });
}
