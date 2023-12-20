import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedSettings = async () => {
  try {
    await prisma.$executeRaw`DELETE FROM client;`;
    await prisma.$executeRaw`DELETE FROM partner;`;
    await prisma.$executeRaw`DELETE FROM consultation;`;

    const clientModule = await prisma.client.create({
      data: {
        id: "25e03b3e-6cbb-4eed-9dfc-c3b24f6d2540",
        cv_id: "31e7ea3d-3f53-4cdc-b35c-2ff709dd7e59",
      },
    });
    const clientModule1 = await prisma.client.create({
      data: {
        id: "adc97d6e-14f7-487e-bf4e-e85041bed0f3",
        cv_id: "eb57cd88-df41-40a5-8eca-e0543c7e410a",
      },
    });

    const partnerModule = await prisma.partner.create({
      data: {
        id: "e1583094-8152-48d9-90ec-e1ca5c5d2028",
        name: "Ejaj Ahmad",
        slug: "ejaj-ahmad",
        email: "ejaj@gmail.com",
        mobile: "8377883663",
        is_active: true,
        otp: Number("000000"),
      },
    });
    const partnerModule1 = await prisma.partner.create({
      data: {
        id: "76c002a8-9494-4c05-9a31-20e294d774b4",
        name: "Ravi Pandey",
        slug: "ravi-pandey",
        email: "ravi@gmail.com",
        mobile: "9958068899",
        is_active: true,
        otp: Number("000000"),
      },
    });

    const partnerModule2 = await prisma.partner.create({
      data: {
        id: "5eb1c667-addb-4f03-b998-46ed797ab861",
        name: "Riya Singh",
        slug: "riya-singh",
        email: "riya@gmail.com",
        mobile: "9971068899",
        is_active: true,
        otp: Number("000000"),
      },
    });

    const consultationModule = await prisma.consultation.createMany({
      data: [
        {
          client_id: clientModule.id,
          partner_id: partnerModule.id,
          is_finished: false,
          start_time: new Date(),
        },
        {
          client_id: clientModule1.id,
          partner_id: partnerModule.id,
          is_finished: false,
          start_time: new Date(),
        },
        {
          client_id: clientModule.id,
          partner_id: partnerModule1.id,
          is_finished: false,
          start_time: new Date(),
        },
        {
          client_id: clientModule1.id,
          partner_id: partnerModule1.id,
          is_finished: false,
          start_time: new Date(),
        },
        {
          client_id: clientModule1.id,
          partner_id: partnerModule2.id,
          is_finished: false,
          start_time: new Date(),
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
};

seedSettings();
