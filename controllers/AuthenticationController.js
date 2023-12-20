import { PrismaClient } from "@prisma/client";
import AuthenticationModel from "../model/AuthenticationModel.js";
import { generateAccessToken, generateRefreshToken, validateAccessToken, validateRefreshToken } from "../config/JWT.config.js";
const prisma = new PrismaClient();

export const loginUserWithOtp = (request, response) => {

    const { key, otp } = request.body;

    if (!key || !otp) {
        return response.status(400).send('Invalid Parameters')
    }

    AuthenticationModel.loginUserWithOtp(String(key), otp, (error, data) => {
        if (error) {
            console.error(error)
            return response.status(error.code).send(error.description);
        }
        else {
            return response.status(data.code)
                .cookie('AT', data.description.accessToken, {
                    maxAge: 900000,
                    httpOnly: true
                }).cookie('RT', data.description.refreshToken, {
                    maxAge: 604800000,
                    httpOnly: true
                })
                .send();
        }
    })
}

export const loginUser = (request, response) => {

    const { identification, password } = request.body;

    if (!identification || !password) {
        return response.status(400).send('Invalid Parameters')
    }

    AuthenticationModel.loginUser(identification, password, (error, data) => {
        if (error) {
            return response.status(error.code).send(error.description);
        }
        else {
            return response.status(data.code)
                .cookie('AT', data.description.accessToken, {
                    maxAge: 900000,
                    httpOnly: true
                }).cookie('RT', data.description.refreshToken, {
                    maxAge: 604800000,
                    httpOnly: true
                })
                .send();
        }
    })
}

export const refreshTokens = (request, response) => {
    const { AT, RT } = request.cookies;

    if (!AT && !RT) {
        return response.status(401).send('Not Logged In');
    }

    validateAccessToken(AT, async (error, payload) => {
        if (error) {
            console.error(error)
            validateRefreshToken(RT, async (rError, rPayload) => {
                if (rError || !rPayload) {
                    return response.status(401).send();
                }
                else {
                    const currentUser = await prisma.partner.findUnique({
                        where: {
                            id: rPayload.partnerID
                        }
                    });

                    if (!currentUser) {
                        return response.status(401).send();
                    }

                    const newAccessToken = generateAccessToken(rPayload.partnerID);
                    const newRefreshAccessToken = generateRefreshToken(rPayload.partnerID);
                    const userId = rPayload.partnerID

                    return response.status(204)
                        .cookie('AT', newAccessToken, {
                            maxAge: 900000,
                            httpOnly: true
                        }).cookie('RT', newRefreshAccessToken, {
                            maxAge: 604800000,
                            httpOnly: true
                        }).cookie('UUID', userId, {
                            maxAge: 604800000,
                            httpOnly: true
                        })
                        .send();
                }
            })
        }
        else {
            const currentUser = await prisma.partner.findFirst({
                where: {
                    id: payload.userID,
                    is_active: true,
                }
            });

            if (!currentUser) {
                return response.status(401).send();
            }

            return response.status(204).send();
        }
    })
}

export const forgotPassword = (request, response) => {
    const { identification } = request.body;

    if (!identification) {
        return response.status(400).send('Invalid Parameters')
    }

    AuthenticationModel.forgotPassword(identification, (error, data) => {
        if (error) {
            return response.status(error.code).send(error.description);
        }
        else {
            return response.status(data.code).send(data.description);
        }
    })
}

export const updatePassword = (request, response) => {
    const { verificationToken, newPassword, otp } = request.body;

    if (!verificationToken || !newPassword || !otp) {
        return response.status(400).send('Invalid Parameters')
    }

    AuthenticationModel.updatePassword(verificationToken, newPassword, otp, (error, data) => {
        if (error) {
            return response.status(error.code).send(error.description);
        }
        else {
            return response.status(data.code).send(data.description);
        }
    })
}

export const logoutUser = (request, response) => {
    return response.status(204).clearCookie('AT', { httpOnly: true }).clearCookie('RT', { httpOnly: true }).send();
}