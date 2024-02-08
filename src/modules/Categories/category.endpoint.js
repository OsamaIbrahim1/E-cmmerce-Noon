import { systemRoles } from "../../utils/system-role.js";

export const endPointsRoles = {
  ADD_CATEGORY: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
};
