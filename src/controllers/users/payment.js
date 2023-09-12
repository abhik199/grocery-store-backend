const Razorpay = require("razorpay");
const { key_id, Key_Secret } = require("../../../config/config");
const crypto = require("crypto");
const {
  cardModel,
  userModel,
  addressesModel,
  orderModel,
} = require("../../models/models");
const { createTransactions } = require("../admin/transactions");
const invoiceService = require("../../services/invoiceSendServices");


exports.creteOrderId = async (amount) => {
  try {
    var instance = new Razorpay({
      key_id: key_id,
      key_secret: Key_Secret,
    });
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    return { status: true, order };
  } catch (error) {
    throw new Error("Something went wrong");
  }
};

exports.verifyTransaction = async (req, res, next) => {
  const { id } = req.user;
  try {
    var instance = new Razorpay({
      key_id: key_id,
      key_secret: Key_Secret,
    });
    // this function when user verify transaction  then automatically  call
    createTransactions();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    let expectedSignature = crypto
      .createHmac("sha256", Key_Secret)
      .update(body.toString())
      .digest("hex");
    if (expectedSignature === razorpay_signature) {
      res
        .status(200)
        .json({ status: true, message: "transaction successfully " });
      const user = await userModel.findOne({ where: { id: id } });
      const email = user.email;
      const data = await cardModel.findAll({ where: { userId: id } });
     const order = await orderModel.findOne({ where: { order_id: razorpay_order_id } });
    const address = order.address;


      const userOrders = data.map((card) => ({
        name: card.name,
        discount_price: card.discount_price,
        quantity: card.quantity,
        subtotal: card.subtotal,
        method: "online",
        address:address,
      }));

      // generate invoice
      invoiceService(email, userOrders, user);
     
      // delete card items when transaction successfully

      await cardModel.destroy({ where: { userId: id } });

      //
      return;
    }
    return res
      .status(400)
      .json({ status: false, message: "failed transaction" });
  } catch (error) {
    return next(error);
  }
};
