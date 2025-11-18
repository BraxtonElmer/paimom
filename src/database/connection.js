import { Sequelize } from 'sequelize';
import config from '../config/config.js';
const sequelize = new Sequelize(config.database.database, config.database.username, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    pool: config.database.pool,
});
export default sequelize;
//# sourceMappingURL=connection.js.map