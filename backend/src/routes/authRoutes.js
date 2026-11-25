const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const passwordResetRoutes = require('./passwordResetRoutes');

router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));
router.use(passwordResetRoutes('user'));
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);

module.exports = router;
