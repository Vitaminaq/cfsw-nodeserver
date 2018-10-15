var express = require('express');  // 加载express模块
var app = express(); // 启动Web服务器

var port = process.env.PORT || 3000; // 设置端口号：3000
app.listen(port); // 监听 port[3000]端口
console.log('start on port' + port);

var path = require('path');
// 引入path模块的作用：因为页面样式的路径放在了bower_components，告诉express，请求页面里所过来的请求中，如果有请求样式或脚本，都让他们去bower_components中去查找

var mongoose = require('mongoose'); // 加载mongoose模块
var db = mongoose.connect('mongodb://localhost:27017/cfswalldb'); // 连接mongodb本地数据库imovie
console.log('MongoDB connection success!');

app.locals.moment = require('moment'); // 载入moment模块，格式化日期

var serveStatic = require('serve-static');  // 静态文件处理
app.use(serveStatic('public')); // 路径：public

var bodyParser = require('body-parser');
// 因为后台录入页有提交表单的步骤，故加载此模块方法（bodyParser模块来做文件解析），将表单里的数据进行格式化
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var _underscore = require('underscore'); // _.extend用新对象里的字段替换老的字段

var allmodle = require('./models/cfsw.js'); // 载入mongoose编译后的模型movie



app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("Content-Type", "text/html; charset=utf-8");
    next();
});

// 用户注册
app.post('/api/user/register', function (req, res) {
    var usermes = null;
    var nickname = req.body.nickname;
    if (nickname !== 'undefined') {
        var mes;
        allmodle.usermes.findByNickname(nickname, function (err, nk) {
            if (err) {
                console.log(err);
                var mes = "请求错误!";
                res.json({mes: mes});
                
            } else if (nk === null) {
                usermes = new allmodle.usermes({
                    nickname: req.body.nickname,
                    name: req.body.name,
                    password: req.body.password,
                    sex: req.body.sex,
                    age: req.body.age,
                });
                usermes.save(function (err, movie) {
                    if (err) {
                        console.log(err);
                    }
                    allmodle.usermes.findByNickname(nickname, function (err, mes) {
                        var idcomment = mes._id + 'comment';
                        var idcomments = new mongoose.Schema({
                            comment: [{
                                title: String,
                                msg: String
                            }],
                            replyname: Array,
                        });
                        var idcomm = mongoose.model(idcomment, idcomments);
                        var idcom = new idcomm({
                            comment: [],
                            replyname: []
                        })
                        idcom.save(function(err, idcom) {
                            if (err) {
                                console.log(err);
                                var mes = "请求错误!";
                                res.json({mes: mes});
                            } else {
                                var idreply = mes._id + 'reply';
                                var idreplys = new mongoose.Schema({
                                reply: [{
                                    title: String,
                                    comment: String,
                                    msg: String
                                }],
                                    replyname: Array
                                })
                                var idrepl = mongoose.model(idreply, idreplys);
                                var idrep = new idrepl({
                                    reply: [],
                                    replyname: []
                                })
                                idrep.save(function(err, rep) {
                                    if (err) {
                                        var mes = "请求错误!";
                                        res.json({mes: mes});
                                        console.log(err);
                                    } else {
                                        var mes = "注册成功!";
                                        res.json({mes: mes,}); 
                                    }
                                })
                            }
                        })
                    })               
                });
            } else if (nk !== null) {
                 var mes = "此昵称已存在!";
                 res.json({mes: mes});      
            }            
        });
    }
});

// 用户登录
app.post('/api/user/login', function (req, res) {
    var nickname = req.body.nickname;
    var password = req.body.password;
    try {
        allmodle.usermes.findByNP(nickname, password, function (err, np) {
            if (err) {
                console.log(err);
                var mes = "请求错误!";
                res.json({mes: mes});   
            } else if (np.length > 0) {
                res.json({nickname: np[0].nickname});
            } else if (np.length === 0) {
                var mes = "用户名或密码错误!";
                res.json({mes: mes});
            }
        });
    } catch (err) {
        res.json({code: 500});
    }
});

// 重置密码
app.post('/api/user/reset', function (req, res) {
    var nickname = req.body.nickname;
    var name = req.body.name;
    var sex = req.body.sex;
    var age = req.body.age;
    allmodle.usermes.findPW(nickname, name, sex, age, function (err, m) {
        if (err) {
            console.log(err);
            var mes = "请求错误!";
            res.json({mes: mes});   
        }
        m[0].password = req.body.password;
        var _chatroomsg = new allmodle.usermes(m[0]);
        _chatroomsg.save(function (err, chatroomsg) {
            if (err) {
                console.log(err);
                var mes = "请求错误!";
                res.json({mes: mes});
            }
            var mes = "重置成功!";
            res.json({mes: mes});
        });
    });
});

// 首页信息条目
app.get('/api/user/chatroomsg', function (req, res) {
    var page,limit;
    if (typeof(req.query.page)  === 'string') {
        page = req.query.page * req.query.limit;
    }
    if (typeof(req.query.limit)  === 'string') {
        limit = req.query.limit - 0;
    }
    allmodle.chatroomsg.findbyPage(limit, page, function (err, all) {
        if (err) {
            console.log(err);
            var mes = "请求错误!";
            res.json({mes: mes});   
        } else if (all.length > 0) {
            res.json({mes: all});
        } else if (all.length === 0) {
            var mes = "暂无信息";
            res.json({mes: mes});
        }
    });
});

// 发表文章
app.post('/api/user/publish', function (req, res) {
    var publish = null;
        publish = new allmodle.chatroomsg({
            nickname: req.body.nickname,
            title: req.body.title,
            msg: req.body.msg,
            click: {
                num: 0,
                name: []
            },
            viewnum: 0,
            commentunm: 0,
            commentxt: [],
            createtime: Date.now()
        });
        publish.save(function (err, publish) {
            if (err) {
                console.log(err);
            }
            var mes;
            if (publish === undefined) {
                mes = "error"
                res.json({mes: mes})
            } else {
                mes = "发表成功!";
                res.json({mes: mes});
            }  
        });           
});

// 详情页
app.post('/api/user/detail', function (req, res) {
    var id = req.body.id;
    allmodle.chatroomsg.findOne(id, function (err, one) {
        if (err) {
            console.log(err);
            var mes = "请求错误!";
            res.json({mes: mes});
        } else  {
            res.json({mes: one[0]});
        }
    });
});

// 点赞文章
app.post('/api/user/artic/agree', function (req, res) {
    var arr = req.body.nickname
    allmodle.chatroomsg.findOne(req.body.id, function (err, one) {
        if (err) {
            mes = "请求错误!";
            res.json({mes: mes});
            console.log(err);
        }
        var index = one[0].click.name.indexOf(req.body.nickname);
        if (index !== -1) {
            one[0].click.name.splice(index, 1);
            one[0].click.num--;
            mes = '取消成功!';
        } else {
            one[0].click.num++;
            one[0].click.name.push(arr);
            mes = "点赞成功!";
        }
        var _chatroomsg = new allmodle.chatroomsg(one[0]);
        _chatroomsg.save(function (err, acomment) {
            console.log(acomment);
            if (err) {
                console.log(err);
                mes = "请求错误!";
                res.json({mes: mes});
            }
            res.json({mes: mes});
        });
    });
});

// 评论
app.post('/api/user/comment', function (req, res) {
    var obj = {
        c_name: req.body.nickname,
        c_time: Date.now(),
        c_msg: req.body.msg,
        c_agree: {
            num: 0,
            name: []
        }
    }
    allmodle.chatroomsg.findOne(req.body.id, function (err, one) {
        if (err) {
                console.log(err);
        }
        one[0].commentunm++;
        one[0].commentxt.push(obj);
        var _chatroomsg = new allmodle.chatroomsg(one[0]);
        _chatroomsg.save(function (err, chatroomsg) {
            if (err) {
                console.log(err);
                var mes = "请求错误!";
                res.json({mes: mes});
            }
            var mes = "评论成功!";
            res.json({mes: mes});
        });
    });
});

// 点赞评论
app.post('/api/user/agree/comment', function (req, res) {
    var arr = req.body.nickname
    allmodle.chatroomsg.findOne(req.body.id, function (err, one) {
        if (err) {
            console.log(err);
            mes = "请求错误!";
            res.json({mes: mes});
        }
        var index = one[0].commentxt[req.body.index].c_agree.name.indexOf(req.body.nickname);
        if (index !== -1) {
            one[0].commentxt[req.body.index].c_agree.name.splice(index, 1);
            one[0].commentxt[req.body.index].c_agree.num--;
            mes = '取消成功!';
        } else {
            one[0].commentxt[req.body.index].c_agree.num++;
            one[0].commentxt[req.body.index].c_agree.name.push(arr);
            mes = "点赞成功!";
        }
        var _chatroomsg = new allmodle.chatroomsg(one[0]);
        _chatroomsg.save(function (err, acomment) {
            if (err) {
                console.log(err);
                mes = "请求错误!";
                res.json({mes: mes});
            }
            res.json({mes: mes});
        });
    });
});

// 浏览量
app.post('/api/user/view', function (req, res) {
    var arr = req.body.nickname
    allmodle.chatroomsg.findOne(req.body.id, function (err, one) {
        if (err) {
                console.log(err);
        }
        one[0].viewnum++;
        var _chatroomsg = new allmodle.chatroomsg(one[0]);
        _chatroomsg.save(function (err, acomment) {
            if (err) {
                console.log(err);
                var mes = "请求错误!";
                res.json({mes: mes});
            }
            var mes = "浏览成功!";
            res.json({mes: mes});
        });
    });
});

