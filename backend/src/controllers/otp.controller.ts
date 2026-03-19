import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { transporter } from "../config/email";
import { otpStore } from "../utils/otpStore";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ================= SEND OTP =================
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;



    console.log("===== SEND OTP API CALLED =====");
console.log("EMAIL:", email);



    if (!email) {
      return res.status(400).json({
        message: "Email không được để trống",
      });
    }

    console.log("REQUEST EMAIL:", email);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại",
      });
    }

    const otp = generateOTP();

    // lưu OTP
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    console.log("OTP GENERATED:", otp);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "OTP đặt lại mật khẩu",
      text: `Mã OTP của bạn là: ${otp}`,
    });

    console.log("OTP SENT SUCCESS:", email);

    res.json({
      message: "OTP đã gửi vào email",
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    res.status(500).json({
      message: "Không gửi được email",
    });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Thiếu email hoặc OTP",
      });
    }

    const data = otpStore[email];

    if (!data) {
      return res.status(400).json({
        message: "OTP không tồn tại",
      });
    }

    if (Date.now() > data.expires) {
      delete otpStore[email];

      return res.status(400).json({
        message: "OTP hết hạn",
      });
    }

    if (data.otp !== otp) {
      return res.status(400).json({
        message: "OTP sai",
      });
    }

    console.log("OTP VERIFIED:", email);

    res.json({
      message: "OTP hợp lệ",
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    res.status(500).json({
      message: "Lỗi xác thực OTP",
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Thiếu email hoặc mật khẩu",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    user.password_hash = hash;

    await user.save();

    delete otpStore[email];

    console.log("PASSWORD UPDATED:", email);

    res.json({
      message: "Đổi mật khẩu thành công",
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Không thể đổi mật khẩu",
    });
  }
};