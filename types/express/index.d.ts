import { User } from "../../generated/prisma"; // ajuste o caminho conforme seu projeto

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}