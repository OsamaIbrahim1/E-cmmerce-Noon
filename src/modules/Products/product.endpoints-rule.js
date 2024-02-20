import { systemRoles } from "../../utils/system-role.js";

export const endPointsRoles = {
  ADD_PRODUCT: [systemRoles.ADMIN],
  UPDATE_PRODUCT: [systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
  DELETE_PRODUCT: [systemRoles.ADMIN,systemRoles.SUPER_ADMIN],
};
