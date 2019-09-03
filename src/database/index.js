import Sequelize from 'sequelize';
import databaseConfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import Registration from '../app/models/Registration';

const models = [User, File, Meetup, Registration];
class Database {
  constructor() {
    this.init();
  }

  init() {
    // conexão com o banco de dados usando Sequelize passando as configurações
    this.connection = new Sequelize(databaseConfig);
    // Passa por todos os models passando a conexão com o banco para seu método init, criado anteriormente
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
