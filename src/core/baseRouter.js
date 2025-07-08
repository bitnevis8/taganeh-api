const express = require("express");
const baseRouter = express.Router();

// Import routers
const userRouter = require('../modules/user/route');
const authRouter = require('../modules/user/auth/route');
const roleRouter = require('../modules/user/role/route');
const fileUploadRouter = require('../modules/fileUpload/route');
const articleRouter = require('../modules/articles/route');

// Use routers
baseRouter.use('/user', userRouter);
baseRouter.use('/user/auth', authRouter);
baseRouter.use('/user/role', roleRouter);
baseRouter.use('/file-upload', fileUploadRouter);
baseRouter.use('/articles', articleRouter);

module.exports = baseRouter;
