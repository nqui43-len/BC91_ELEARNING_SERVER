import fs from "fs";

export const removeTempFile = (filePath?: string): void => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
