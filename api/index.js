require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const Routes = require("./server/routes/index");
const cookieParser = require("cookie-parser");

// * dayjs use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

// * config server
const app = express();
// get db from model
const db = require("./server/repositories/models/index");
const { users, accommodations, billings, buildings, rooms, waterZones, zones } = db;
db.sequelize.sync();

app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false }));
app.use(cookieParser());
app.use(express.json());


// * routes

app.use("/v1", Routes);




// get data via id
// app.get("/water_zone/:id", async (req, res) => {
//     id = req.params.id;
//     info = await users.findOne({
//         where: { id: id },
//     });
//     if (!info) {
//         res.sendStatus(500);
//     } else {
//         res.status(200).json({ status: "success", status_code: 200, result: { water_zone: info } });
//     }
// });


// get data to table


// // get all electricity billings /billings/electricity
// app.get("/billings/electricity", async (req, res) => {
//     date = req.query.date;
//     try {
//         billing = await users.findAll({
//             include: [
//                 {
//                     model: accommodations,
//                     attributes: ["id", "host"],
//                     where: {
//                         deleted: "false",
//                     },
//                     include: [
//                         {
//                             model: billings,
//                             attributes: [
//                                 "id",
//                                 "billing_type",
//                                 "status",
//                                 "unit",
//                                 "price",
//                                 "price_diff",
//                                 "total_pay",
//                                 "updated_at",
//                             ],
//                             where: {
//                                 billing_type: "electricity",
//                                 updated_at: date,
//                             },
//                         },
//                         {
//                             model: rooms,
//                             attributes: [
//                                 "id",
//                                 "building_id",
//                                 "roomNo",
//                                 "roomType",
//                                 "electricityNo",
//                                 "electricityMeterNo",
//                                 "status",
//                             ],
//                             include: [
//                                 {
//                                     model: zones,
//                                     attributes: ["id", "name"],
//                                 },
//                                 {
//                                     model: buildings,
//                                     attributes: ["id", "name"],
//                                 },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//             attributes: ["id", "rank", "affiliation", "firstName", "lastName"],
//         });

//         if (!billing) {
//             res.status(500);
//         }
//         if (date && billing) {
//             res.status(200).json({ status: "success", status_code: 200, result: billing });
//         } else {
//             res.status(200).json({ status: "success", status_code: 200, result: billing });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });
// // get residents /resident
// app.get("/residents", async (req, res) => {
//     token = "null";
//     try {
//         residents = await users.findAll({
//             include: [
//                 {
//                     model: accommodations,
//                     attributes: ["id", "host"],
//                     include: [
//                         {
//                             model: rooms,
//                             attributes: [
//                                 "id",
//                                 "roomNo",
//                                 "roomType",
//                                 "electricityNo",
//                                 "electricityMeterNo",
//                                 "waterNo",
//                                 "waterMeterNo",
//                                 "status",
//                             ],
//                         },
//                     ],
//                 },
//             ],
//             attributes: ["id", "rank", "affiliation", "firstName", "lastName"],
//         });
//         if (!token) {
//             res.status(401).json({ status: "unauthorized", status_code: 401, error_message: "invalid API Key" });
//         }
//         if (!residents) {
//             res.status(200).json({ status: "success", status_code: 200, result: residents });
//         } else {
//             res.status(200).json({ status: "success", status_code: 200, result: residents });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });
// // get building room /buildings
// app.get("/buildings", async (req, res) => {
//     try {
//         Allbuilding = await zones.findAll({
//             include: [
//                 {
//                     model: waterZones,
//                     attributes: ["id", "name"],
//                     include: [
//                         {
//                             model: buildings,
//                             attributes: ["id", "name", "imageUrl"],
//                             include: [
//                                 {
//                                     model: rooms,
//                                     attributes: [
//                                         "id",
//                                         "roomNo",
//                                         "roomType",
//                                         "electricityNo",
//                                         "electricityMeterNo",
//                                         "waterNo",
//                                         "waterMeterNo",
//                                         "status",
//                                     ],
//                                 },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//             attributes: ["id", "name"],
//         });
//         if (!Allbuilding) {
//             res.status(200).json({ status: "success", status_code: 200, result: Allbuilding });
//         } else {
//             res.status(200).json({ status: "success", status_code: 200, result: Allbuilding });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// });


// // delete
// app.delete("/billings/:id", async (req, res) => {
//     id = req.params.id;
//     info = await buildings.update({
//         where: { id: id },
//     });
//     if (!info) {
//         res.sendStatus(500);
//     } else {
//         res.send("deleted");
//     }
// });

// // add เน่าใน
// app.post("/billings/add", async (req, res) => {
//     data = req.body.data;
//     info = await billings.create({
//         billingType: data.billingType,
//         status: data.status,
//         unit: data.unit,
//         price: data.price,
//         priceDiff: data.priceDiff,
//         totalPay: data.totalPay,
//         accommodationsId: data.accommodationsId,
//         id: data.id,
//     });
//     if (!info) {
//         res.sendStatus(500);
//     } else {
//         res.status(200).json(info);
//     }
// });
// app.put("/playerInfo/:id", async (req, res) => {
//     id = req.params.id;
//     info = await billings.update({
//         where: { id: id },
//     });
//     if (!info) {
//         res.sendStatus(500);
//     } else {
//         res.sendStatus(200);
//     }
// });

// * start server
const host = process.env.SERVER_HOST || "0.0.0.0";
const port = process.env.SERVER_PORT || 3000;

app.listen(port, host, () => {
    console.log(`API listening on ${host}:${port}`);
});
