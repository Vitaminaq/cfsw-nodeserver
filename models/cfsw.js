var mongoose = require('mongoose');
var schema = require('../schemas/cfsw.js'); //引入'../schemas/movie.js'导出的模式模块

// 编译生成movie模型
var usermes = mongoose.model('usermes', schema.usermes);
var chatroomsg = mongoose.model('chatroomsg', schema.chatroomsg);

// 将movie模型[构造函数]导出
module.exports = {
	usermes,
	chatroomsg
};