import GoogleAuthLibrary from "google-auth-library";

const admins = ['molpick98@gmail.com'];

export function needAuth(req, res, next) {
    if (!req.header('Authorization'))
        return res.sendStatus(HTTP_UNAUTHORIZED);

    const token = req.header('Authorization').replace('Bearer ', '');
    const GoogleClient = new GoogleAuthLibrary.OAuth2Client('22198592066-5d2g6ruijvqt2ne5psd5hdhlbhq8dotd.apps.googleusercontent.com');
    GoogleClient.getTokenInfo(token)
        .then(info => {
            req.user = {
                email: info.email,
                admin: admins.includes(info.email)
            };
            next();
        }).catch(err => {
            return res.sendStatus(HTTP_UNAUTHORIZED);
        });
}

export function needAdmin(req, res, next) {
    if (!req.header('Authorization'))
        return res.sendStatus(HTTP_UNAUTHORIZED);

    const token = req.header('Authorization').replace('Bearer ', '');
    const GoogleClient = new GoogleAuthLibrary.OAuth2Client('22198592066-5d2g6ruijvqt2ne5psd5hdhlbhq8dotd.apps.googleusercontent.com');
    GoogleClient.getTokenInfo(token)
        .then(info => {
            if (admins.includes(info.email)) {
                req.user = {
                    email: info.email,
                    admin: true
                };
                next();
            } else {
                return res.sendStatus(HTTP_UNAUTHORIZED);
            }
        }).catch(err => {
            return res.sendStatus(HTTP_UNAUTHORIZED);
        });
}
