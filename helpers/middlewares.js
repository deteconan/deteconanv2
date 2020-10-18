export function checkRequiredGET() {
    const requiredAttributes = arguments;

    return function (req, res, next) {
        if (requiredAttributes.length < 1)
            return res.sendStatus(400);

        for (let i = 0; i < requiredAttributes.length; i++) {
            const param = req.params[requiredAttributes[i]];
            if (!param || param === '')
                return res.status(400).send(`Missing parameter: ${requiredAttributes[i]}`);
        }

        next();
    }
}

export function checkRequiredPOST() {
    const requiredAttributes = arguments;

    return function (req, res, next) {
        if (requiredAttributes.length < 1)
            return res.sendStatus(400);

        for (let i = 0; i < requiredAttributes.length; i++) {
            const param = req.body[requiredAttributes[i]];
            if (!param || param === '')
                return res.status(400).send(`Missing parameter: ${requiredAttributes[i]}`);
        }

        next();
    }
}
