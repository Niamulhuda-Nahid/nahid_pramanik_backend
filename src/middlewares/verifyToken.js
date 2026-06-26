const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try{
        // Authorization header check
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).send({
                success: false,
                message: "Access denied. No token provided."
            });
        };

        // format: Bearer token
        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).send({
                success: false,
                message: "Invalid token format."
            });
        };

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // save decode user info
        req.user = decoded;

        next();
    }catch(error){
        return res.status(401).send({
            success: false,
            message: "Invalid or expired token."
        });
    };
};

module.exports = verifyToken;