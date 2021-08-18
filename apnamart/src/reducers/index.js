import { combineReducers } from "redux";
import Itemslist from "./allitems";
import Category from "./category";
import Subcategory from "./subcategory";
import cartcount from "./cartcount";
import Auth from "./auth";
import Profile from "./profile";
import opacity from "./opacity";

export default combineReducers({
    Itemslist,
    Category,
    Subcategory, 
    cartcount,
    Auth,
    Profile,
    opacity
})