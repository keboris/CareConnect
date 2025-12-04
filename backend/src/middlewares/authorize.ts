import type { RequestHandler } from "express";

const authorize = (Model: any): RequestHandler => {
  return async (req, res, next) => {
    console.log("Model : ", Model);
    if (req.params.id) {
      const { id } = req.params;
      const model = await Model.findById(id);

      console.log(
        "✅ authorize",
        "Model:",
        Model.modelName,
        "ID:",
        id,
        "User:",
        req.user
      );

      if (!model)
        return next(
          new Error(`Model : ${Model.modelName} not found`, {
            cause: { status: 404 },
          })
        );

      let ownerId: string | string[] | undefined;
      if (Model.modelName != "HelpSession") {
        if (Model.modelName === "ChatMessage") {
          ownerId = [
            model.senderId?.toString(),
            model.receiverId?.toString(),
          ].filter((s): s is string => typeof s === "string");
        } else {
          ownerId = model.userId?.toString() ?? model._id.toString();
        }
      } else {
        if (model.offerId) {
          ownerId = model.userRequesterId?.toString();
        } else if (model.requestId) {
          ownerId = model.userHelperId?.toString();
        }
      }

      console.log("✅ authorize", "Checking ownership for user:", req.user?.id);
      // otherwise only allow if user is the author
      const userId = req.user?.id;
      if (Array.isArray(ownerId)) {
        if (!userId || !ownerId.includes(userId)) {
          return next(
            new Error(
              `Forbidden, you cannot modify this ${Model.modelName.toLowerCase()}`,
              {
                cause: { status: 403 },
              }
            )
          );
        }
      } else {
        if (ownerId !== userId) {
          return next(
            new Error(
              `Forbidden, you cannot modify this ${Model.modelName.toLowerCase()}`,
              {
                cause: { status: 403 },
              }
            )
          );
        }
      }
      next();
    }

    //allow, if user is admin
    if (req.user?.roles?.includes("admin")) {
      return next();
    }
  };
};

export default authorize;
