/**
 * @file users接口子路由
 * @author zhanglu
 * 
 */

let express = require('express');
let router = express.Router();
let User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    };
    User.findOne(param, function (err, doc) {
        return new Promise((resolve, reject) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(doc);
            }
        });
    }).then(doc => {
        res.cookie('userId', doc.userId, {
            path: '/',
            maxAge: 1000 * 60 * 60
        });
        res.cookie('userName', doc.userName, {
            path: '/',
            maxAge: 1000 * 60 * 60
        });
        res.json({
            status: '0',
            msg: '',
            result: {
                userName: doc.userName
            }
        });
    }).catch(err => {
        res.json({
            status: '1',
            msg: err.message
        });
    });
});

router.post('/logout', function (req, res, next) {
    res.cookie('userId', '', {
        path: '/',
        maxAge: -1
    });
    res.json({
        status: '0',
        msg: '',
        result: ''
    });
});

router.get('/checkLogin', function (req, res, next) {
    if (req.cookies.userId) {
        res.json({
            status: '0',
            msg: '',
            result: req.cookies.userName
        });
    }
    else {
        res.json({
            status: '1',
            msg: '未登录',
            result: ''
        });
    }
});

router.get('/cartList', function (req, res, next) {
    let userId = req.cookies.userId;

    User.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            res.json({
                status: '0',
                msg: '',
                result: doc.cartList
            });
        }
    });
});

// 删除购物车中的商品
router.post('/del', function (req, res, next) {
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    User.update({
        userId: userId
    }, {
        $pull: {
            cartList: {
                productId: productId
            }
        }
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            res.json({
                status: '0',
                msg: '',
                result: doc
            });
        }
    });
});


// 修改购物车中商品的数量
router.post('/cartEdit', function (req, res, next) {
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    let productNum = req.body.productNum;
    let checked = req.body.checked;

    User.update({
        'userId': userId,
        'cartList.productId': productId
    }, {
        'cartList.$.productNum': productNum,
        'cartList.$.checked': checked
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            res.json({
                status: '0',
                msg: '',
                result: doc
            });
        }
    });
});

// 修改购物车中所有的商品是否选中
router.post('/cartEditCheckAll', function (req, res, next) {
    let userId = req.cookies.userId;
    let checkAll = req.body.checkAll;

    User.findOne({userId: userId}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            doc.cartList.forEach(element => {
                element.checked = checkAll;
            });
            doc.save(function (err1, doc1) {
                if (err) {
                    res.json({
                        status: '1',
                        msg: err1.message,
                        result: ''
                    });
                } else {
                    res.json({
                        status: '0',
                        msg: '',
                        result: 'success'
                    });
                }
            });
        }
    });
});


// 获取用户地址接口
router.get('/addressList', function (req, res, next) {
    let userId = req.cookies.userId;

    User.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        }
        else {
            res.json({
                status: '0',
                msg: '',
                result: doc.addressList
            });
        }
    });
});

// 设置默认地址接口
router.post('/setDefault', function (req, res, next) {
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;

    User.findOne({userId: userId}, function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            });
        } else {
            let addressList = doc.addressList;
            addressList.forEach(item => {
                if (item.addressId === addressId) {
                    item.isDefault = true;
                }
                else {
                    item.isDefault = false;
                }
            });

            doc.save(function (err1, doc1) {
                if (err) {
                    res.json({
                        status: '1',
                        msg: err1.message,
                        result: ''
                    });
                } else {
                    res.json({
                        status: '0',
                        msg: '',
                        result: ''
                    });
                }
            });
        }
    });
});

module.exports = router;