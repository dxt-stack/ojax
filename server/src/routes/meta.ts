import { Router } from "express";
import { CATEGORIES, CONDITIONS, UNIVERSITIES, EVENT_CATEGORIES } from "../lib/catalog.js";

export const metaRouter = Router();

metaRouter.get("/catalog", (_req, res) => {
  res.json({ categories: CATEGORIES, conditions: CONDITIONS, eventCategories: EVENT_CATEGORIES });
});

metaRouter.get("/universities", (_req, res) => {
  res.json({ universities: UNIVERSITIES });
});
