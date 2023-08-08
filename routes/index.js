var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('welcome', { title: 'Thesis Sapphire' });
});

router.get('/signIn', function (req, res, next) {
  res.render('accounts/signIn');
});

router.get('/register', function (req, res, next) {
  res.render('accounts/register');
});

router.get('/temp', function (req, res, next) {
  res.render('temp1');
});

router.get('/t2', function (req, res, next) {
  // res.render('temp1.haml');
  res.render('pt')
});

router.get('/team', function (req, res, next) {
  // res.render('temp1.haml');
  res.render('team')
});


router.get('/error', function (req, res, next) {
  // res.render('temp1.haml');
  res.render('error')
});



module.exports = router;
