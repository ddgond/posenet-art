const express = require('express');
const router = express.Router();


/**
 * Say hello
 * @name POST/api/hello
 */
router.post('/', (req, res) => {
    let helloText = req.body.hello;

    console.log(helloText);
    res.status(200).json({"message": `You said: ${helloText}`}).end();

});

module.exports = router;
