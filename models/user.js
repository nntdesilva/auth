const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

userSchema.statics.findAndValidate = async function(username, password) {
	const foundUser = await this.findOne({ username });
	if (!foundUser) {
		return false;
	}
	const result = await bcrypt.compare(password, foundUser.password);
	return result ? foundUser : false;
};

userSchema.pre('save', async function(next) {
	if (!this.isModified('password')) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
