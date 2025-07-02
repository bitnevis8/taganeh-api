const express = require("express");
const baseRouter = express.Router();
const userRouter = require("../modules/user/route");
const fileUploadRouter = require("../modules/fileUpload/route");
// const aryafouladRouter = require('../modules/aryafoulad/routes');

// Article module routes
const tagFamilyRouter = require('../modules/articles/tagFamily/route');
const tagRouter = require('../modules/articles/tag/route');
const categoryRouter = require('../modules/articles/category/route');
const agencyRouter = require('../modules/articles/agency/route');
const articleRouter = require('../modules/articles/article/route');

// ✅ مسیرهای API
baseRouter.use("/user", userRouter);
baseRouter.use("/upload", fileUploadRouter);
// baseRouter.use('/aryafoulad', aryafouladRouter);

// Article module routes
baseRouter.use('/articles/tag-families', tagFamilyRouter);
baseRouter.use('/articles/tags', tagRouter);
baseRouter.use('/articles/categories', categoryRouter);
baseRouter.use('/articles/agencies', agencyRouter);
baseRouter.use('/articles', articleRouter);

module.exports = baseRouter;
