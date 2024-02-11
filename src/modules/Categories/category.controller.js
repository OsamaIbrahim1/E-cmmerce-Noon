import slugify from "slugify";
import Category from "../../../DB/models/category.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import SubCategories from "../../../DB/models/Sub-Category.model.js";
import Brand from "../../../DB/models/brand.model.js";

//================================ add category ================================//
/**
 * * detructure the required data from request body and request headers
 * * check in name is duplicated
 * * generate the slug
 * * upload image category
 * * generate the category object
 * * create the category document
 * * response successfully created
 */
export const addCategory = async (req, res, next) => {
  // * detructure the required data from request body and request headers
  const { name } = req.body;
  const { _id } = req.authUser;

  // * check in name is duplicated
  const isNameDuplicated = await Category.findOne({ name });
  if (isNameDuplicated)
    return next(new Error("name category is duplicated", { cause: 400 }));

  // * generate the slug
  const slug = slugify(name, "-");
  if (!slug) return next(new Error("slug not created", { cause: 400 }));

  // * upload image category to cloudinary
  if (!req.file) return next({ cause: 400, message: "Image is required" });

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`,
    });

  // * generate the category object
  const category = {
    name,
    slug,
    Image: { secure_url, public_id },
    folderId,
    addedBy: _id,
  };

  // * create the category document
  const categoryDocument = await Category.create(category);

  // * response successfully created
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: categoryDocument,
  });
};

//================================ update category ================================//
/**
 * * destructure name and oldPublicId from the request body
 * * destructure category id from the request params
 * * destructure _id from the request authUser
 * * check if category exists
 * * check is user wants to update name category
 * * check if new name === old name
 * * check if new name not already existing
 * * update name and slug category
 * * check if user wants to update image
 * * update image and use same public id  and folder id
 *  * set value for the updatedBy
 * * save values
 * * success response
 */
export const updateCategory = async (req, res, next) => {
  // * destructure name and oldPublicId from the request body
  const { name, oldPublicId } = req.body;
  // * destructure category id from the request params
  const { categoryId } = req.params;
  // * destructure _id from the request authUser
  const { _id } = req.authUser;

  // * check if category exists
  const category = await Category.findById(categoryId);
  if (!category) return next(new Error(`Category not found`, { cause: 404 }));

  // * check is user wants to update name category
  if (name) {
    // * check if new name === old name
    if (category.name === name) {
      return next(
        new Error(`please enter different name from the existing one.`, {
          cause: 404,
        })
      );
    }

    // * check if new name not already existing
    const isNameDuplicated = await Category.findOne({ name });
    if (isNameDuplicated) {
      return next(new Error(`please enter different name.`, { cause: 400 }));
    }

    // * update name and slug category
    category.name = name;
    category.slug = slugify(name, "-");
  }

  // * check if user wants to update image
  if (oldPublicId) {
    if (!req.file) {
      return next(new Error(`please enter new image`, { cause: 400 }));
    }

    const newPublicId = oldPublicId.split(`${category.folderId}/`)[1];

    // * update image and use same public id  and folder id
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
        public_id: newPublicId, 
      });
    category.Image.secure_url = secure_url;
  }

  // * set value for the updatedBy
  category.updatedBy = _id;

  // * save values
  await category.save();

  // * success response
  res
    .status(200)
    .json({ success: true, message: "Successfully   updated", category });
};

//================================ delete category ================================//
/**
 * * destructure categoryId from params
 * * destructure _id from request authUser
 * * check if user is owner this category and delete
 * * delete image and folder of image category
 * * response successfully
 */
export const deleteCategory = async (req, res, next) => {
  // * destructure categoryId from params
  const { categoryId } = req.params;

  // * delete category
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    return next(new Error("category not found", { cause: 404 }));
  }

  // * delete all subCategories for this category
  const subCategories = await SubCategories.deleteMany({ categoryId });
  if (subCategories.deletedCount <= 0) {
    console.log(subCategories.deletedCount);
    console.log("there is no related subCategories");
  }

  // * delete all brands for this category
  const brands = await Brand.deleteMany({ categoryId });
  if (brands.deletedCount <= 0) {
    console.log(brands.deletedCount);
    console.log("there is no related brands");
  }

  // * delete image and folder of image category
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`
  );

  // * response successfully
  res.status(200).json({
    success: true,
    message: "category deleted successfully",
    date: category,
  });
};

//================================ get all category ================================//
/**
 * * get all category
 * * response successfully
 */
export const getAllCategory = async (req, res, next) => {
  // * get all category with populate "subCategories" and populate "Brands"
  const categories = await Category.find().populate([
    {
      path: "subCategories",
      populate: [{ path: "Brands" }],
    },
  ]);

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: "categories found", date: categories });
};
