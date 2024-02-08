import { customAlphabet } from "nanoid";

const generateUniqueString = (length) => {
  const nanoid = customAlphabet("12345abcde", length || 5);
  return nanoid();
};

export default generateUniqueString;
