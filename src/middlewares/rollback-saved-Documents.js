
export const rollbackSavedDocuments = async (req, res, next) => {
  console.log("rollbackSavedDocuments middleware");
  if (req.savedDocuments) {
    console.log(req.savedDocuments);
    const { model, _id } = req.savedDocuments;
    await model.findByIdAndDelete(_id);
  }
};
