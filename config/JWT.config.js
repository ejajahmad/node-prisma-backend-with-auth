import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const generateAccessToken = (partnerID) => {
    if (process.env.ACCESS_TOKEN_SECRET) {
        return jwt.sign({ partnerID: partnerID }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });
    }
}

export const generateRefreshToken = (partnerID) => {
    if (process.env.REFRESH_TOKEN_SECRET)
        return jwt.sign({ partnerID: partnerID }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });
};

export const generateVerificationToken = (partnerID) => {
    if (process.env.VERIFICATION_TOKEN_SECRET)
        return jwt.sign(
            { partnerID: partnerID },
            process.env.VERIFICATION_TOKEN_SECRET,
            { expiresIn: "10m" }
        );
};

export const validateAccessToken = (accessToken, callBack) => {
    if (process.env.ACCESS_TOKEN_SECRET) {
        jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            (expired, partnerID) => {
                return callBack(expired, partnerID);
            }
        );
    }
};

export const validateRefreshToken = (refreshToken, callBack) => {
    if (process.env.REFRESH_TOKEN_SECRET) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (expired, partnerID) => {
                return callBack(expired, partnerID);
            }
        );
    }
};

export const validateVerificationToken = (verificationToken, callBack) => {
    if (process.env.VERIFICATION_TOKEN_SECRET) {
        jwt.verify(
            verificationToken,
            process.env.VERIFICATION_TOKEN_SECRET,
            (expired, partnerID) => {
                return callBack(expired, partnerID);
            }
        );
    }
};

export const authenticateUser = (
    request,
    response,
    next
) => {
    const { AT, RT } = request.cookies;
    if (!AT && !RT) {
        return response.status(307).clearCookie("AT").clearCookie("RT").send();
    }

    validateAccessToken(AT, async (error, payload) => {
        if (error) {
            validateRefreshToken(RT, async (rError, rPayload) => {
                if (rError) {
                    return response
                        .status(307)
                        .clearCookie("AT")
                        .clearCookie("RT")
                        .send();
                }
                const partnerID = rPayload.partnerID;

                const partner = await prisma.partner.findFirst({
                    where: {
                        id: partnerID,
                        is_active: true
                    },
                });

                if (!partner) {
                    return response
                        .status(307)
                        .clearCookie("AT")
                        .clearCookie("RT")
                        .send();
                }
                request.body.partnerID = rPayload.partnerID;
                const newAccessToken = generateAccessToken(partner.id);
                const newRefreshToken = generateRefreshToken(partner.id);

                response.status(204)
                    .cookie('AT', newAccessToken, {
                        maxAge: 900000,
                        httpOnly: true
                    }).cookie('RT', newRefreshToken, {
                        maxAge: 604800000,
                        httpOnly: true
                    });

                next();
            });
        } else {
            const partnerID = payload.partnerID;

            const partner = await prisma.partner.findFirst({
                where: {
                    id: partnerID,
                    is_active: true
                },
            });

            if (!partner) {
                return response.status(307).clearCookie("AT").clearCookie("RT").send();
            }
            request.body.partnerID = payload.partnerID;
            next();
        }
    });
};