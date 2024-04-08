import { systemRoles } from "../../utils/system-role.js";

export const endPointsRoles = {
  ADD_CATEGORY: [systemRoles.SUPER_ADMIN],
  Get_All_SubCategories: [
    systemRoles.ADMIN,
    systemRoles.USER,
    systemRoles.SUPER_ADMIN,
  ],
  ALL_USERS: [systemRoles.ADMIN, systemRoles.USER, systemRoles.SUPER_ADMIN],
};
