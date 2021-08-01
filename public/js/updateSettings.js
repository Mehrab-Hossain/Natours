import axios from "axios";
import { showAlert } from "./alert";

export const updateSetting = async (data, type) => {
  try {
    const url = type === "password" ? "/api/v1/users/updateMyPassword" : "/api/v1/users/updateMe";
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} Updated Successfully!`);
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
