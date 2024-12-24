const jwt = require("jsonwebtoken");
const { Instance } = require("../models");

class InstanceService {
  extractUserId(token) {
    const tokenToBeVerified = token.split(" ")[1];
    const decodeToken = jwt.verify(tokenToBeVerified, process.env.JWT_SECRET); //not sure should i use verfiy idhr? oh ha warna unauth wala bhi chal jayega
    const userId = decodeToken.id;
    return userId;
  }

  async toFindInstance(token) {
    try {
      const userId = extractUserId(token);
      const instance_id = await Instance.findOne({
        where: { userId },
      });
      if (!instance_id) {
        throw new Error("instance not found");
      } else {
        return instance_id;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = InstanceService;
