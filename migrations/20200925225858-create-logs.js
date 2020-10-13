"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable("logs", {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING,
        },
        hash: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        remoteAddr: {
          type: Sequelize.STRING,
        },
        remoteUser: {
          type: Sequelize.STRING,
        },
        timeStr: {
          type: Sequelize.STRING,
        },
        time: {
          type: Sequelize.DATE,
        },
        request: {
          type: Sequelize.STRING,
        },
        status: {
          type: Sequelize.STRING,
        },
        httpReferer: {
          type: Sequelize.STRING,
        },
        httpXForwardedFor: {
          type: Sequelize.STRING,
        },
        client: {
          type: Sequelize.STRING,
        },
        clientUsername: {
          type: Sequelize.STRING,
        },
        requestBody: {
          type: Sequelize.TEXT("long"),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      })
      .then(() =>
        queryInterface.addIndex("logs", ["hash", "client", "clientUsername"])
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("logs");
  },
};
