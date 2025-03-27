import express from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../controllers/lead.controller.js";
const router = express.Router();
router.post("/leads", createLead);
router.get("/leads", getAllLeads);
router.get("/leads/:id", getLeadById);
router.put("/leads/:id", updateLead);
router.delete("/leads/:id", deleteLead);
export default router;
// import express from "express";
// import {
//   createLead,
//   getAllLeads,
//   getLeadById,
//   updateLead,
//   deleteLead,
// } from "../controllers/lead.controller.js";
// import Verifyjwt from "../middleware/auth.meddleware.js";
// const router = express.Router();
// router.route("/leads").post(Verifyjwt, createLead);
// router.route("/leads").get(Verifyjwt, getAllLeads);
// router.route("/leads/:id").get(Verifyjwt, getLeadById);
// router.route("/leads/:id").put(Verifyjwt, updateLead);
// router.route("/leads/:id").delete(Verifyjwt, deleteLead);
// export default router;
