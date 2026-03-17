import express from "express";
import auth, { authorizeRoles } from "../middlewares/auth.middleware.js";

import {
 getDashboardStats,
 getAllUsers,
 banUser,
 deleteUser,
 getAllCampaigns,
 deleteCampaign,
 getAllDeals,
 getEscrows,
 getDeliverables,
getInfluencers,
getBrands,
pauseCampaign ,
getApplications,
getReviews,
deleteReview,
getTransactions,
getRevenue,
getDisputes,
refundEscrow,
releasePayment
 
} from "../controllers/admin.controller.js";

const router = express.Router();

//////////////////////////////////////////////////////
// DASHBOARD
//////////////////////////////////////////////////////

router.get(
 "/dashboard",
 auth,
 authorizeRoles("admin"),
 getDashboardStats
);

//////////////////////////////////////////////////////
// USERS
//////////////////////////////////////////////////////

router.get(
 "/users",
 auth,
 authorizeRoles("admin"),
 getAllUsers
);

router.patch(
 "/users/:id/ban",
 auth,
 authorizeRoles("admin"),
 banUser
);

router.delete(
 "/users/:id",
 auth,
 authorizeRoles("admin"),
 deleteUser
);

//////////////////////////////////////////////////////
// CAMPAIGNS
//////////////////////////////////////////////////////

router.get(
 "/campaigns",
 auth,
 authorizeRoles("admin"),
 getAllCampaigns
);

router.delete(
 "/campaigns/:id",
 auth,
 authorizeRoles("admin"),
 deleteCampaign
);

//////////////////////////////////////////////////////
// DEALS
//////////////////////////////////////////////////////

router.get(
 "/deals",
 auth,
 authorizeRoles("admin"),
 getAllDeals
);

//////////////////////////////////////////////////////
// ESCROWS
//////////////////////////////////////////////////////

router.get(
 "/escrows",
 auth,
 authorizeRoles("admin"),
 getEscrows
);

//////////////////////////////////////////////////////
// DELIVERABLES
//////////////////////////////////////////////////////

router.get(
 "/deliverables",
 auth,
 authorizeRoles("admin"),
 getDeliverables
);

router.get(
 "/influencers",
 auth,
 authorizeRoles("admin"),
 getInfluencers
);

router.get(
 "/brand",
 auth,
 authorizeRoles("admin"),
 getBrands
);

router.patch(
    "/campaigns/:id/pause",
    auth,
    authorizeRoles("admin"),
    pauseCampaign 
);

router.get(
    "/applications",
    auth,
    authorizeRoles("admin"),
    getApplications
);

router.get(
    "/reviews",
    auth,
    authorizeRoles("admin"),
    getReviews
);

router.delete(
    "/reviews/:id",
    auth,
    authorizeRoles("admin"),
    deleteReview 

);
router.get(
 "/transactions",
 auth,
 authorizeRoles("admin"),
 getTransactions
);
 router.get("/revenue",
 auth,
 authorizeRoles("admin"),
 getRevenue

 );
 router.get(
 "/disputes",
 auth,
 authorizeRoles("admin"),
 getDisputes
);
router.patch(
 "/refund/:escrowId",
 auth,
 authorizeRoles("admin"),
 refundEscrow
);
router.patch(
 "/escrows/:escrowId/release",
 auth,
 authorizeRoles("admin"),
 releasePayment
)

export default router;