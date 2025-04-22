const express = require('express');
const router = require('express').Router();


router.get('/', (req, res)=> {
    res.render('picture-gallery', {user : req.user});
}
);


module.exports = router;