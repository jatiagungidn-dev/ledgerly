import { NextFunction, Request, Response } from "express";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";
import * as categoryService from "./category.service.js";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = createCategorySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const category = await categoryService.create(req.userId, result.data);

    return res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.findAll(req.userId);

    return res.status(200).json({
      status: "success",
      count: categories.length,
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoryService.findById(req.params.id, req.userId);

    return res.status(200).json({
      status: "success",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = updateCategorySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request body",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const category = await categoryService.update(
      req.params.id,
      req.userId,
      result.data.name!,
    );

    if (!result.data.name) {
      return res.status(400).json({
        status: "fail",
        message: "Category name is required for update",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Category update successfully",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await categoryService.remove(req.params.id, req.userId);

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
