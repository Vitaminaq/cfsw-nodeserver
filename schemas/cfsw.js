var mongoose = require('mongoose');

// 用户注册
var usermes = new mongoose.Schema({
    nickname: String,
    name: String,
    password: String,
    sex: String,
    age: Number,
    // meta 更新或录入数据的时间记录
    createtime: {
        type: Date,
        default: Date.now()
    },
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
    nickname: String,
    title:String,
    msg: String,
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
    // insertOne: function (, cb) {
    //     return this
    //         .insert({})
    //         .exec(cb)
    // }
}
// 导出movieSchema模式
module.exports = {
    usermes,
    chatroomsg
};

