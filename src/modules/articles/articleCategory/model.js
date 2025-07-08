const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class ArticleCategory extends Model {}

ArticleCategory.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    articleId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id'
      }
    },
    categoryId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: "ArticleCategory",
    tableName: "article_categories",
    timestamps: true,
    underscored: true
  }
);

module.exports = ArticleCategory; 