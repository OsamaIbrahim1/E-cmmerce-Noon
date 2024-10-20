import slugify from "slugify";

import SubCategory from "../../../DB/models/Sub-Category.model.js";
import Brand from "../../../DB/models/brand.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import Product from "../../../DB/models/product.model.js";
import { APIFeature } from "../../utils/api-features.js";

//===================================== add brand =====================================//
/**
 * * destructure the required data from the request object
 * * check if subcategory is already exists
 * * duplicate brand document check
 * * check Category
 * * generate slug
 * * uploade image
 * * object Brand
 * * create Brand Document
 * * response Successfully
 */
export const addBrand = async (req, res, next) => {
  // * destructure the required data from the request object
  const { name } = req.body;
  const { categoryId, subCategoryId } = req.query;
  const { _id } = req.authUser;

  // * check if subcategory is already exists
  const subCategory = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );
  if (!subCategory) {
    return next(new Error("Subcategory not found", { cause: 400 }));
  }

  // * duplicate brand document check
  const brand = await Brand.findOne({ name, subCategoryId });
  if (brand) {
    return next(
      new Error("Brand already exists for this subCategory.", { cause: 400 })
    );
  }

  // * check Category
  if (subCategory.categoryId._id.toString() !== categoryId) {
    return next(new Error("Category not found", { cause: 404 }));
  }

  // * generate slug
  const slug = slugify(name, "-");
  if (!slug) return next(new Error("slug not Created", { cause: 409 }));

  // * uploade image
  if (!req.file)
    return next(new Error("please uploade the brand logo", { cause: 400 }));

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}/Brands/${folderId}`,
    });

  // * rollback if event any error
  req.folder = `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}/Brands/${folderId}`;

  // * object Brand
  const objectBrand = {
    name,
    slug,
    Image: { secure_url, public_id },
    folderId,
    addedBy: _id,
    subCategoryId,
    categoryId,
  };

  // * create Brand Document
  const brandDocument = await Brand.create(objectBrand);
  req.savedDocuments = { model: Brand, _id: brandDocument._id };

  if (!brandDocument) {
    return next(new Error("Brand not created", { cause: 400 }));
  }

  // * response Successfully
  res
    .status(201)
    .json({ success: true, message: "Successfully created", brandDocument });
};

//===================================== delete brand =====================================//
/**
 * * destructure data from request params and request authUser
 * * delete brand by owner
 * * delete logo from cloudinary
 * * delete product from database
 * * response successfully
 */
export const deleteBrand = async (req, res, next) => {
  // * destructure data from request params and request authUser
  const { brandId } = req.params;
  const { _id } = req.authUser;

  // * delete brand by owner
  const brand = await Brand.findByIdAndDelete({
    _id: brandId,
    addedBy: _id,
  });
  if (!brand) return next(new Error("you can't delete a brand"));

  // * delete logo from cloudinary
  const newPathFolder = brand.Image.public_id.split(`${brand.folderId}`)[0];

  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${newPathFolder}`
  );
  await cloudinaryConnection().api.delete_folder(`${newPathFolder}`);

  // * delete product from database
  await Product.deleteMany({ brandId: brand.brandId });

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: "Successfully deleted", brand });
};

//===================================== update brand =====================================//
/**
 * * destructure the required data from the request body and query and authUser
 * * check if the brand is already existing
 * * if user wants ubdate name
 * * if new name === old name
 * * if name is already existing
 * * update name and slug
 * * if user wants to change image
 * * set value for the updatedBy
 * * save values
 * * success response
 */
export const updateBrand = async (req, res, next) => {
  // * destructure the required data from the request body and query and authUser
  const { name, oldPublicId } = req.body;
  const { brandId } = req.query;
  const { _id } = req.authUser;

  // * check if the brand is already existing
  const brand = await Brand.findById(brandId).populate([
    {
      path: "subCategoryId",
      populate: [{ path: "categoryId" }],
    },
  ]);
  if (!brand) return next(new Error(` brand not found`, { cause: 404 }));

  // * if user wants ubdate name
  if (name) {
    // * if new name === old name
    if (brand.name === name) {
      return next(
        new Error(`please enter different name from the existing one.`, {
          cause: 400,
        })
      );
    }

    // * if name is already existing
    const isNameDuplicated = await Brand.findOne({ name });
    if (isNameDuplicated) {
      return next(new Error(`please enter different name.`, { cause: 400 }));
    }

    // * update name and slug
    brand.name = name;
    brand.slug = slugify(name, "-");
  }

  // * if user wants to change image
  if (oldPublicId) {
    if (!req.file) return next(new Error(`please enter image`, { cause: 400 }));

    const newPathFolder = oldPublicId.split(`${brand.folderId}/`)[1];

    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${brand.subCategoryId.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`,
        public_id: newPathFolder,
      });
    brand.secure_url = secure_url;
  }

  // * set value for the updatedBy
  brand.updatedBy = _id;

  // * save values
  await brand.save();

  // * success response
  res
    .status(200)
    .json({ success: true, message: "Successfully updated", brand });
};

//===================================== get all brands =====================================//
/**
 * * get all brands
 * * response Successfully
 */
export const getBrands = async (req, res, next) => {
  // * get all brands
  const brands = await Brand.find();
  if (!brands) return next(new Error("Brands not found", { cause: 404 }));

  // * response Successfully
  res
    .status(200)
    .json({ success: true, message: "brands existing.", data: brands });
};
//===================================== get brand By Id =====================================//
/**
 * * destructure data from params
 * * get brand by id
 * * response Successfully
 */
export const getBrandById = async (req, res, next) => {
  // * destructure data from params
  const { brandId } = req.params;

  // * get brand by id
  const brand = await Brand.findById({ _id: brandId });
  if (!brand) return next(new Error("Brand not found", { cause: 404 }));

  // * response Successfully
  res
    .status(200)
    .json({ success: true, message: "brands existing.", data: brand });
};

//================================= get All brand with pagination =================================//
/**
 * * destructure data from query
 * * find data and paginate it
 * * response successfully
 */
export const getAllBrandsWithPagination = async (req, res, next) => {
  //  * destructure data from query
  const { page, size, sort, ...search } = req.query;

  // * find data and paginate it
  const features = new APIFeature(req.query, Brand.find())
    .pagination({
      page,
      size,
    })
    .sort(sort);

  const brands = await features.mongooseQuery;

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: "get all brands", data: brands });
};
