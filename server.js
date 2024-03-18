const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const mogoose = require("mongoose");
const mongo_url = process.env.MONGO_URL;
// config view engi
app.set("view engine", "ejs");
app.set("views", "./views");
// config static files
app.use(express.static("./views"));
// config middleware
app.use(express.urlencoded({ extended: true }));
// connect
mogoose
  .connect(mongo_url)
  .then(() => {
    console.log("Connect successfully!");
  })
  .catch((err) => {
    console.log(err);
  });
// schema
const customerSchema = new mogoose.Schema({
  id: Number,
  name: String,
  email: String,
  address: String,
  total: Number,
});
const customerModel = mogoose.model("customers", customerSchema);
// router
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("/phamvanhau", async (req, res) => {
  const customers = await customerModel.find();
  res.render("index.ejs", { customers });
});
app.get("/getCustomer", async (req, res) => {
  const customerData = await customerModel.find();
  res.json(customerData);
});
app.get("/edit", async (req, res) => {
    const id = Number(req.query.id);
    try {
        const customer = await customerModel.findOne({ id: id });
        if (!customer) {
            return res.status(404).send("Customer not found");
        }
        res.render("edit.ejs", { customer: customer });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// method
// delete
app.post("/delete", async (req, res) => {
  try {
    const listCheckBoxSelected = Object.keys(req.body);
    // Kiểm tra xem có checkbox nào được chọn không
    if (!listCheckBoxSelected || listCheckBoxSelected.length === 0) {
      return res.redirect("/phamvanhau");
    }
    // Duyệt qua danh sách các ID được chọn và xóa chúng
    for (const idDelete of listCheckBoxSelected) {
      // Xóa khách hàng từ cơ sở dữ liệu bằng ID
      await customerModel.deleteOne({ id: idDelete });
    }
    // Sau khi xóa thành công, chuyển hướng lại đến trang danh sách khách hàng
    return res.redirect("/phamvanhau");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});
// save
app.post("/save", async (req, res) => {
  try {
    const id = Number(req.body.id);
    const name = req.body.name;
    const email = req.body.email;
    const address = req.body.address;
    const total = Number(req.body.total);
    const customer = new customerModel({
      id: id,
      name: name,
      email: email,
      address: address,
      total: total,
    });
    await customer.save();
    return res.redirect("/phamvanhau");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error!");
  }
});
// update
// app.post("/edit", async (req, res) => {
//   try {
//     const id = Number(req.body.id);
//     const name = req.body.upName;
//     const email = req.body.upEmail;
//     const address = req.body.upAddress;
//     const total = req.body.upTotal;

//     await customerModel.findByIdAndUpdate(
//       id, // ID của khách hàng cần cập nhật
//       { name: name, email: email, address: address, total: total }, // Dữ liệu cập nhật
//       { new: true } // Tùy chọn để trả về bản ghi đã được cập nhật
//     );
//     return res.redirect("/phamvanhau");
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("Internal Server Error");
//   }
// });
app.post("/edit", async (req, res) => {
    try {
      // Lấy và kiểm tra dữ liệu đầu vào từ biểu mẫu
      const id = Number(req.body.id);
      const name = req.body.upName;
      const email = req.body.upEmail;
      const address = req.body.upAddress;
      const total = req.body.upTotal;
  
      // Kiểm tra xem có trường bắt buộc nào không được cung cấp không
  
      // Cập nhật thông tin của khách hàng trong cơ sở dữ liệu
      await customerModel.findOneAndUpdate(
        { id: id }, // Tìm khách hàng cần cập nhật bằng trường id
        { name: name, email: email, address: address, total: total }, // Dữ liệu cập nhật
        { new: true } // Trả về bản ghi đã được cập nhật
      );
  
      // Chuyển hướng người dùng sau khi cập nhật thành công
      return res.redirect("/phamvanhau");
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  });
  
// listen
app.listen(port, () => {
  console.log(`Example app on for port ${port}`);
});
