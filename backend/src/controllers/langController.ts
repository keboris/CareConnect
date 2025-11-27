import { Skill, Language } from "#models";
import type { langInputSchema } from "#schemas";
import type z from "zod";

import type { RequestHandler } from "express";

type LanguageDTO = z.infer<typeof langInputSchema>;

export const createLanguage: RequestHandler<
  unknown,
  { message: string; skill?: any; language?: any },
  LanguageDTO
> = async (req, res) => {
  try {
    const { en, de, fr } = req.body;
    const page = req.baseUrl;

    console.log(page);
    const ModelPage = page.includes("skills") ? Skill : Language;
    const returnedLabel = page.includes("skills") ? "skill" : "language";

    if (!ModelPage) {
      return res.status(400).json({ message: "Invalid path for creation" });
    }

    const lang = await ModelPage.create({
      en,
      de,
      fr,
    });
    res.status(201).json({
      message: `${ModelPage.modelName} created successfully`,
      [returnedLabel]: lang,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the language/skill",
    });
  }
};

export const getLanguages: RequestHandler = async (req, res) => {
  const page = req.baseUrl;
  const ModelPage = page.includes("skills") ? Skill : Language;
  if (!ModelPage) {
    return res.status(400).json({ message: "Invalid path for fetching" });
  }

  try {
    const lang = await ModelPage.find();
    if (!lang.length) {
      return res
        .status(404)
        .json({ message: `No ${ModelPage.modelName} found` });
    }
    res.status(200).json({ [ModelPage.modelName.toLowerCase() + "s"]: lang });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while fetching ${ModelPage.modelName.toLowerCase()}s`,
    });
  }
};

export const getLanguageById: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;

    const page = req.baseUrl;

    const ModelPage = page.includes("skills") ? Skill : Language;
    if (!ModelPage) {
      return res.status(400).json({ message: "Invalid path for fetching" });
    }

    const lang = await ModelPage.findById(id);

    if (!lang) {
      return res
        .status(404)
        .json({ error: `${ModelPage.modelName} with id:${id} not found` });
    }
    res.status(200).json(lang);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const updateLanguage: RequestHandler<
  { id: string },
  any,
  LanguageDTO
> = async (req, res) => {
  try {
    const { id } = req.params;
    const { en, de, fr } = req.body;
    const page = req.baseUrl;

    const ModelPage = page.includes("skills") ? Skill : Language;
    if (!ModelPage) {
      return res.status(400).json({ message: "Invalid path for updating" });
    }

    if (!en) return res.status(400).json({ error: "en is required" });

    const lang = await ModelPage.findById(id);
    if (!lang)
      return res
        .status(404)
        .json({ error: `${ModelPage.modelName} not found` });
    lang.en = en;
    lang.de = de || lang.de;
    lang.fr = fr || lang.fr;
    await lang.save();
    res
      .status(200)
      .json({ message: `${ModelPage.modelName} updated successfully`, lang });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const deleteLanguage: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const page = req.baseUrl;

    const ModelPage = page.includes("skills") ? Skill : Language;
    if (!ModelPage) {
      return res.status(400).json({ message: "Invalid path for deletion" });
    }

    const lang = await ModelPage.findByIdAndDelete(id);
    if (!lang) {
      return res
        .status(404)
        .json({ error: `${ModelPage.modelName} not found` });
    }
    res.json({ message: `${ModelPage.modelName} deleted successfully` });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};
