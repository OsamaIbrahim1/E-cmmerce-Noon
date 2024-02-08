import { systemRoles } from "../../utils/system-role.js";

export const endPointsRoles = {
  UPDATE_AND_DELETE_USER: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};
