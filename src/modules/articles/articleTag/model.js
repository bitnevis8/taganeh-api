const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../../core/database/mysql/connection");

class ArticleTag extends Model {}

ArticleTag.init(
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
        model: 'news_articles',
        key: 'id'
      }
    },
    tagId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'news_tags',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: "ArticleTag",
    tableName: "news_article_tags",
    timestamps: true,
    underscored: true
  }
);

module.exports = ArticleTag; 