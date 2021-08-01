import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged in Successfuly");
      window.setTimeout(() => {
        location.assign("/"); // if success full then req will be with /
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://127.0.0.1:3000/api/v1/users/logout",
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged Out Successfuly");
      window.setTimeout(() => {
        location.assign("/").reload(true);
        //location.reload(true); // if success full then req will be with /
      }, 1500);
    }
  } catch (error) {
    showAlert("error", "Error , Logging Out!,Try again");
  }
};
