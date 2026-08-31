import { Request, Response } from "express";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";
import * as categoryService from "./category.service.js";

export const createCategory = async (req: Request, res: Response) => {
  const result = createCategorySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const payload = {
    ...result.data,
    type: result.data.type === "INCOME" ? "REVENUE" : result.data.type,
  } as const;

  const category = await categoryService.create(req.userId, payload);

  return res.status(201).json({
    category,
  });
};

export const getCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.findAll(req.userId);

  return res.status(200).json({
    categories,
  });
};

export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const category = await categoryService.findById(req.params.id, req.userId);

  return res.status(200).json({
    category,
  });
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = updateCategorySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid request body",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const category = await categoryService.update(
    req.params.id,
    req.userId,
    result.data.name,
  );

  return res.status(200).json({
    category,
  });
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await categoryService.remove(req.params.id, req.userId);

  return res.status(204).send();
};
