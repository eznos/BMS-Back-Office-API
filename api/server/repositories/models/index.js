require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config")[env];
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

sequelize
    .authenticate()
    .then((auth) => {
        console.log("Connection has been established successfully.");
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error);
    });

fs.readdirSync(__dirname)
    .filter((file) => {
        return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//ส่วนนี้เป็นการ import model ของ table ใน database เข้ามาเพื่อตั้งต่า relation
db.users = require("../models/users")(sequelize, Sequelize);
db.accommodations = require("../models/accommodations")(sequelize, Sequelize);
db.billings = require("../models/billings")(sequelize, Sequelize);
db.zones = require("../models/zones")(sequelize, Sequelize);
db.water_zones = require("../models/water_zones")(sequelize, Sequelize);
db.buildings = require("../models/buildings")(sequelize, Sequelize);
db.rooms = require("../models/rooms")(sequelize, Sequelize);
//1:M users:accommodations
db.users.hasMany(db.accommodations, {
    foreignKey: { name: "userId", field: "user_id" },
});
db.accommodations.belongsTo(db.users, { foreignKey: "user_id" });

// accommodation : billding 1:M
db.accommodations.hasMany(db.billings, {
    foreignKey: { name: "accommodationId", field: "accommodation_id" },
});
db.billings.belongsTo(db.accommodations, { foreignKey: "accommodation_id" });

// 1:M rooms:accommodation
db.rooms.hasMany(db.accommodations, {
    foreignKey: { name: "roomId", field: "room_id" },
});
db.accommodations.belongsTo(db.rooms, { foreignKey: "room_id" });

// 1:M zones:rooms
db.zones.hasMany(db.rooms, {
    foreignKey: { name: "zoneId", field: "zone_id" },
});
db.rooms.belongsTo(db.zones, { foreignKey: "zone_id" });

// 1:M water_zone:room 1:M
db.water_zones.hasMany(db.rooms, {
    foreignKey: { name: "water_zoneId", field: "water_zones_id" },
});
db.rooms.belongsTo(db.water_zones, { foreignKey: "water_zones_id" });

// 1:M water_zones:buildings
db.water_zones.hasMany(db.buildings, {
    foreignKey: { name: "water_zonesID", field: "water_zones_id" },
});
db.buildings.belongsTo(db.water_zones, { foreignKey: "water_zones_id" });

// 1:M buildings:rooms
db.buildings.hasMany(db.rooms, {
    foreignKey: { name: "buildingsId", field: "buildings_id" },
});
db.rooms.belongsTo(db.buildings, { foreignKey: "buildings_id" });

// 1:M zones:buildings คีย์ถูก
db.zones.hasMany(db.buildings, {
    foreignKey: { name: "zoneId", field: "zone_id" },
});
db.buildings.belongsTo(db.zones, { foreignKey: "zone_id" });

// 1:M zones:water_zone
db.zones.hasMany(db.water_zones, {
    foreignKey: { name: "zoneId", field: "zoneId" },
});
db.water_zones.belongsTo(db.zones, { foreignKey: "zoneId" });

module.exports = db;
