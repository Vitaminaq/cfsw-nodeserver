var mongoose = require('mongoose');

// 用户注册
var usermes = new mongoose.Schema({
    nickname: {
        type: String, // 或者'string'
        required: true  //字段必填
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sex: {
        type: String,
        required: true
    },
    age: { 
        type: Number,
        required: true
    },
    // meta 更新或录入数据的时间记录
    createtime: {
        type: Date,
        default: Date.now()
    }
});
// 静态方法
usermes.statics = {
    findByNickname: function (nickname, cb) {
        return this
            .findOne({nickname: nickname})
            .exec(cb)
    },
    findByNP: function (nickname, password, cb) {
        return this
            .find({nickname: nickname, password: password})
            .exec(cb)
    },
    findPW: function (nickname, name, sex, age, cb) {
        return this
            .find({nickname: nickname, name: name, sex: sex, age: age})
            .exec(cb)
    }
}

// 首页
var chatroomsg = new mongoose.Schema({
    nickname: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    click: {
        num: Number,
        name: Array
    },
    viewnum: Number,
    commentunm: Number,
    commentxt: [{
        c_name: String,
        c_time: Date,
        c_msg: String,
        c_agree: {
            num: Number,
            name: Array
        }
    }],
    createtime: Date
});
chatroomsg.statics = {
    findbyPage: function (limit, page, cb) {
        return this
            .find({}).limit(limit).skip(page)
            .sort({'createtime': -1})
            .exec(cb)
    },
    findOne: function (id, cb) {
        return this
             .find({_id: id})
             .exec(cb)
    }
}
// 导出movieSchema模式
module.exports = {
    usermes,
    chatroomsg
};

