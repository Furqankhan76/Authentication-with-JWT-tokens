import { Router } from "express";
import { loginuser, registeruser, Userbyemail, deleteuser, newrefandacctokens, deletebyrefreshtoken} from "../controllers/user_controller.js";

const router = Router()

router.route("/register").post(registeruser)
router.route("/login").get(loginuser)
router.route("/get").get(Userbyemail)
// router.route("/delete").delete(deleteuser)
router.route("/refresh-delete").delete(deletebyrefreshtoken)
router.route("/refresh").post(newrefandacctokens)
export default router