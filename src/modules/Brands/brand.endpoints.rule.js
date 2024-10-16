import { systemRoles } from "../../utils/system-role.js";

export const endPointsRoles = {
  ADD_Brand: [systemRoles.ADMIN],
  ALL_USERS: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};
