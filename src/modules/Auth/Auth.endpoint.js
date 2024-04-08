import { systemRoles } from "../../utils/system-role.js";

export const endPointsRoles = {
  ALL_USERS: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};
