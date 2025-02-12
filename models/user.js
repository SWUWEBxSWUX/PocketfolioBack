const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init({
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_image: {  // 이미지 URL 저장
        type: Sequelize.STRING,
        allowNull: true,
      },
      verification_code: {  // 이메일 인증 코드
        type: Sequelize.STRING,
        allowNull: true,
      },
      verification_expiration: {  // 인증 코드 만료 시간
        type: Sequelize.DATE,
        allowNull: true,
      },
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,  // createdAt, updatedAt 자동 생성
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
  }
}

module.exports = User;