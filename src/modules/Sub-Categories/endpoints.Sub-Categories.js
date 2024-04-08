import { systemRoles } from "../../utils/system-role.js";

export const endPointsRoles = {
  ADD_SUBCATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
  ALL_USERS: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};
