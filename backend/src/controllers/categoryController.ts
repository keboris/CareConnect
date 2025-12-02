import { Category, Offer, Request } from "#models";
import type { categoryInputSchema } from "#schemas";
import type z from "zod";

import type { RequestHandler } from "express";

type CategoryDTO = z.infer<typeof categoryInputSchema>;

export const createCategory: RequestHandler<
  unknown,
  { message: string; category?: any },
  CategoryDTO
> = async (req, res) => {
  try {
    const {
      name,
      nameDE,
      nameFR,
      description,
      descriptionDE,
      descriptionFR,
      icon,
      color,
    } = req.body;
    const category = await Category.create({
      name,
      nameDE,
      nameFR,
      description,
      descriptionDE,
      descriptionFR,
      icon,
      color,
    });
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while creating the category" });
  }
};

export const getCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "offers",
          localField: "_id",
          foreignField: "category",
          as: "offers",
        },
      },
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "category",
          as: "requests",
        },
      },
      {
        $addFields: {
          offersCount: { $size: "$offers" },
          requestsCount: { $size: "$requests" },
        },
      },
      {
        $project: {
          offers: 0,
          requests: 0,
        },
      },
    ]);

    if (!categories.length) {
      return res.status(404).json({ message: "No Category found" });
    }

    res.status(200).json({ categories });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching categories" });
  }
};

export const getCategoryById: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const category = await Category.findById(id);

    if (!category) {
      return res
        .status(404)
        .json({ error: `Category with id:${id} not found` });
    }

    const [offers, requests] = await Promise.all([
      Offer.find({ category: id }),
      Request.find({ category: id }),
    ]);

    res.status(200).json({
      category,
      offersCount: offers.length,
      requestsCount: requests.length,
      offers,
      requests,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateCategory: RequestHandler<
  { id: string },
  any,
  CategoryDTO
> = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      nameDE,
      nameFR,
      description,
      descriptionDE,
      descriptionFR,
      icon,
      color,
    } = req.body;
    if (!name)
      return res.status(400).json({ error: "Name in English is required" });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    category.name = name;
    category.nameDE = nameDE || category.nameDE;
    category.nameFR = nameFR || category.nameFR;
    category.description = description || category.description;
    category.descriptionDE = descriptionDE || category.descriptionDE;
    category.descriptionFR = descriptionFR || category.descriptionFR;
    category.icon = icon || category.icon;
    category.color = color || category.color;

    await category.save();

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteCategory: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getUserCategories: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const categories = await Category.find();

    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const [offersCount, requestsCount] = await Promise.all([
          Offer.countDocuments({ category: category._id, userId }),
          Request.countDocuments({ category: category._id, userId }),
        ]);

        return {
          ...category.toObject(),
          offersCount,
          requestsCount,
        };
      })
    );

    res.status(200).json({ categories: categoriesWithCounts });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};
