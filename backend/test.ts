import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nguyenthithuoanh01112004@gmail.com",
    pass: "vyhthsmndfluvxmm",
  },
});

async function send() {
  await transporter.sendMail({
    from: "nguyenthithuoanh01112004@gmail.com",
    to: "nguyenthithuoanh01112004@gmail.com",
    subject: "Test Mail",
    text: "Hello OTP test",
  });

  console.log("Mail sent");
}

send();