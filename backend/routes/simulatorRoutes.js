const authMiddleware = require('../middleware/authMiddleware');
router.get('/some-secure-data', authMiddleware, (req, res) => {
  // yeh route sirf token verify hone pe chalega
});
