import jwt from 'jsonwebtoken';
const JWT_SECRET = 'diuhbcubckjbcudkjadshc hkzdcbjhcbkhdc';
export const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.cookies?.token || 
          req.body.token || 
          req.query.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Helper function to generate JWT token
export const generateToken = (user) => {
    return jwt.sign(
        { 
            email: user.email, 
            username: user.username 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};