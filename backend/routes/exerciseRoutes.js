import express from 'express'
const router = express.Router()
import {
  getSquatStatus,
  getSquatLive,
  getBicepStatus,
  getBicepLive,
} from "../controllers/exerciseController.js";


router.get("/squat/status", getSquatStatus);
router.get("/squat/live", getSquatLive);
router.get("/bicep/status", getBicepStatus);
router.get("/bicep/live", getBicepLive);


export default router;