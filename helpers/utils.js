export function sendError(err, req, res, next) {
    console.error(err);
    if (req.headersSent)
        return next(err);
    res.status(HTTP_INTERNAL_ERROR)
        .json({ error: err.message, stack: err.stack.split('\n') });
}
