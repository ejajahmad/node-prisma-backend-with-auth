import { PrismaClient } from "@prisma/client";
import { generateAccessToken, generateRefreshToken, generateVerificationToken, validateVerificationToken } from "../config/JWT.config.js";
import { encryptPassword, verifyPassword } from "../config/Hasher.config.js";

const prisma = new PrismaClient();

export default class AuthenticationModel {
  static loginUserWithOtp = async (key, otp, result) => {
    try {
      const user = await prisma.partner.findFirst({
        where: {
          OR: [{ email: key }, { mobile: key }],
        },
      });

      if (!user) {
        return result({ code: 404, description: "No account with this mobile/email" }, null);
      }

      if (Number(otp) !== Number(user.otp)) {
        return result({ code: 401, description: "Invalid OTP" }, null);
      }

      if (!user.is_active) {
        return result({ code: 402, description: "Account Suspended" }, null);
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      return result(null, {
        code: 204,
        description: { accessToken, refreshToken },
      });
    } catch (error) {
      console.error(error);
      return result({ code: 500, description: error }, null);
    } finally {
      prisma.$disconnect();
    }
  };
  static loginUser = async (identification, password, result) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identification }, { mobile: identification }],
        },
      });

      if (!user) {
        return result({ code: 404, description: "No account with this email/mobile" }, null);
      }

      if (!verifyPassword(password, user.password)) {
        return result({ code: 401, description: "Invalid Password" }, null);
      }

      if (!user.is_active) {
        return result({ code: 402, description: "Account Suspended" }, null);
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      return result(null, {
        code: 204,
        description: { accessToken, refreshToken },
      });
    } catch (error) {
      return result({ code: 500, description: error }, null);
    } finally {
      prisma.$disconnect();
    }
  };

  static forgotPassword = async (identification, result) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identification }, { mobile: identification }],
        },
      });

      if (!user) {
        return result({ code: 404, description: "No account with this email/mobile" }, null);
      }

      if (!user.is_active) {
        return result({ code: 402, description: "Account Suspended" }, null);
      }

      const newVerificationToken = generateVerificationToken(user.id);
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          verification_token: "123456",
        },
      });
      return result(null, {
        code: 201,
        description: { verificationToken: newVerificationToken },
      });
    } catch (error) {
      return result({ code: 500, description: error }, null);
    } finally {
      prisma.$disconnect();
    }
  };

  static updatePassword = async (verificationToken, newPassword, otp, result) => {
    validateVerificationToken(verificationToken, async (error, payload) => {
      if (error) {
        return result({ code: 403, description: "Invalid OTP" }, null);
      }

      const currentUser = await prisma.user.findUnique({
        where: {
          id: payload.userID,
        },
      });

      if (!currentUser) {
        return result({ code: 403, description: "You are not authorized to use this OTP" }, null);
      }

      if (currentUser.verification_token !== otp) {
        return result({ code: 401, description: "Invalid OTP" }, null);
      }

      await prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          verification_token: null,
          password: encryptPassword(newPassword),
        },
      });
      return result(null, { code: 204, description: "Password updated" });
    });
  };
}
