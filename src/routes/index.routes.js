import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    return res.status(200).send({mensage: "Servidor funcionando"})
})

export default router;