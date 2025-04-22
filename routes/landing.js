const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('landing', {
        user: req.user,
        query: req.query,
    });
    }   

);

module.exports = router;