import slugify from "slugify";
import subCategory from "../../../DB/models/Sub-Category.model.js";
import Category from "../../../DB/models/category.model.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import Brand from "../../../DB/models/brand.model.js";

// =================================== add subCategory ===================================//
/**
 * * detructure the required data from request body and request headers and request params
 * * check if the name subCategory is doublicated
 * * check if category is already existing
 * * create slug for subCategory
 * * upload image subCategory to Cloudinary
 * * generate the subCategory object
 * * response successfully created
 */
export const addSubCategory = async (req, res, next) => {
  // * detructure the required data from request body and request headers and request params
  const { name } = req.body;
  const { _id } = req.authUser;
  const { categoryId } = req.params;

  // * check if the name subCategory is doublicated
  const isSubCategoryDoublicated = await subCategory.findOne({ name });
  if (isSubCategoryDoublicated) {
    return next(
      new Error("subCategory is already existing,please enter new one", {
        cause: 400,
      })
    );
  }

  // * check if category is already existing
  const category = await Category.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 404 }));

  // * create slug for subCategory
  const slug = slugify(name, "-");
  if (!slug) return next(new Error("slug not created", { cause: 400 }));

  // * upload image subCategory to Cloudinary
  if (!req.file) return next(new Error("Image is required", { cause: 400 }));

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`,
    });

  // * rollback if event any error
  req.folder = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`;

  // * generate the subCategory object
  const subCategoryObject = {
    name,
    slug,
    Image: { secure_url, public_id },
    folderId,
    addedBy: _id,
    categoryId,
  };

  const subCategoryDoccument = await subCategory.create(subCategoryObject);
  req.savedDocuments = { model: subCategory, _id: subCategoryDoccument._id };

  if (!subCategoryDoccument) {
    return next(new Error("SubCategory Not Created", { cause: 404 }));
  }

  // * response successfully created
  res.status(201).json({
    success: true,
    message: "subCategory created successfully",
    data: subCategoryDoccument,
  });
};

// =================================== update subCategory ===================================//
/**
 * * detructure data from body and query and authUser
 * * check if subCategory already exists
 * * if the user wants to update a subCategory
 * * if new name === old name
 * * create new slug and update name and slug
 * * if user update image
 * * set value for the updatedBy
 * * save values
 * * response successfully
 */
export const updateSubCategory = async (req, res, next) => {
  // * detructure data from body and query and authUser
  const { name, oldPublicId } = req.body;
  const { subCategoryId } = req.query;
  const { _id } = req.authUser;

  // * check if subCategory already exists
  const checkSubCategory = await subCategory
    .findById(subCategoryId)
    .populate([{ path: "categoryId" }]);
  if (!checkSubCategory) {
    return next(new Error("SubCategory not found", { cause: 400 }));
  }

  // * if the user wants to update a subCategory
  if (name) {
    // * if new name === old name
    if (checkSubCategory.name === name) {
      return next(
        new Error(`please enter different name from the existing one.`, {
          cause: 400,
        })
      );
    }
    const isNameDuplicated = await subCategory.findOne({ name });
    if (isNameDuplicated) {
      return next(new Error(`please enter different name`, { cause: 400 }));
    }

    // * create new slug and update name and slug
    checkSubCategory.name = name;
    checkSubCategory.slug = slugify(name, "-");
  }

  // * if user update image
  if (oldPublicId) {
    if (!req.file) {
      return next(new Error(`please enter new image`, { cause: 400 }));
    }
    console.log(checkSubCategory.categoryId.folderId);

    const newPublicId = oldPublicId.split(`${checkSubCategory.folderId}/`)[1];
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${checkSubCategory.categoryId.folderId}/SubCategories/${checkSubCategory.folderId}`,
        public_id: newPublicId,
      });
    checkSubCategory.secure_url = secure_url;
  }

  // * set value for the updatedBy
  checkSubCategory.updatedBy = _id;

  // * save values
  await checkSubCategory.save();

  // * response successfully
  res.status(200).json({
    success: true,
    message: "SubCategory updated successfully",
    checkSubCategory,
  });
};

// =================================== delete subCategory ===================================//
/**
 * * desrtucture data from authUser and query
 * * find and delete subCategory
 * * delete subCategory's brand
 * * delete image and folder of image category
 * * response successfully
 */
export const deleteSubCategory = async (req, res, next) => {
  // * desrtucture data from authUser and query
  const { _id } = req.authUser;
  const { subCategoryId } = req.query;

  // * find and delete subCategory
  const subCategories = await subCategory
    .findByIdAndDelete(subCategoryId)
    .populate({ path: "categoryId" });
  if (!subCategories) {
    return next(new Error("subCategory not found", { cause: 400 }));
  }

  // * delete subCategory's brand
  const deleteBrand = await Brand.deleteMany({ subCategoryId });
  if (!deleteBrand) return next(new Error("Brand not found", { cause: 400 }));

  // * delete image and folder of image category
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${subCategories.categoryId.folderId}/SubCategories/`
  );
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${subCategories.categoryId.folderId}/SubCategories/`
  );

  // * response successfully
  res.status(200).json({
    success: true,
    message: "Successfully deleted SubCategory and Brand",
    subCategories,
    deleteBrand,
  });
};

// ============================== get all subcategories with brands ==============================//
/**
 * * get all subCategories and populate "Brands"
 * * response successfully
 */
export const getAllSubcategoriesWithBrands = async (req, res, next) => {
  // * get all subCategories and populate "Brands"
  const allCategories = await subCategory.find().populate([{ path: "Brands" }]);

  // * response successfully
  res.status(200).json({
    success: true,
    message: "found all categories successfully",
    allCategories,
  });
};
