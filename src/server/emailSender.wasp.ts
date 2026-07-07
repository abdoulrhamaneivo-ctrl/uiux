import { type EmailSender } from "@wasp.sh/spec";

export const emailSender: EmailSender = {
  provider: "SMTP",
  defaultFrom: {
    name: "CXSAT Abidjan",
    email: "abdoulrhamane.ivo@gmail.com",
  },
};
