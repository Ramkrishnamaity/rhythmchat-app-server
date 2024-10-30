import { Router } from "express";
import ViewController from "../controllers/view";

const ViewRouter: Router = Router();

ViewRouter.get("/", (req, res) => {
    if(ViewController.isLoggedIn(req)) {
        res.render("AdminPannel/index.ejs", {title: "DashBoard", isLogIn: true});
    } else {
        res.render("AdminPannel/index.ejs", {title: "DashBoard", isLogIn: false});
    }
});

ViewRouter.get("/as", );

export default ViewRouter;