const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PortfolioView = sequelize.define('PortfolioView', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  portfolio_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  user_ip: {
    type: DataTypes.STRING(45),
  },
}, {
  tableName: 'Portfolio_Views',
  timestamps: false,
});

module.exports = PortfolioView;
