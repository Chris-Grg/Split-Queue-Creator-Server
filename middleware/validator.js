// middleware/validateQueue.js
const validateCreate = (req, res, next) => {
    const { queue_name, strategy, ringinuse, timeout, wrapuptime } = req.body;

    if (
        typeof queue_name !== 'string' || 
        typeof strategy !== 'string' || 
        typeof ringinuse !== 'boolean' || 
        typeof timeout !== 'number' || 
        typeof wrapuptime !== 'number') {
        return res.status(400).json({ error: 'Invalid data types' });
    }

    next();
};

const validateDelete=(req,res,next)=>{
    const { queue_name } = req.body

    if (typeof queue_name !== 'string') {
        return res.status(400).json({ error: 'Invalid data type for queue_name' });
    }

    next();
}

const validateUpdateQueue = (req, res, next) => {
    const { newname, strategy, ringinuse, timeout, wrapuptime } = req.body;

    if (typeof newname !== 'string' ||
        typeof strategy !== 'string' ||
        typeof ringinuse !== 'boolean' ||
        typeof timeout !== 'number' ||
        typeof wrapuptime !== 'number') {
        return res.status(400).json({ error: 'Invalid data types' });
    }

    next();
};

module.exports = {
    validateCreate,
    validateDelete,
    validateUpdateQueue
};