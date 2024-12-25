const AWS = require("aws-sdk");
const { Instance } = require("../models");
const jwt = require("jsonwebtoken");

AWS.config.update({ region: process.env.AWS_REGION });

class InstanceService {
  constructor() {
    this.ec2 = new AWS.EC2({ apiVersion: "2016-11-15" });
  }

  generateAccessToken(instanceId) {
    console.log(
      `[InstanceService] Generating accessToken for instance: ${instanceId}`
    );
    if (!process.env.JWT_SECRET) {
      console.error(
        "[InstanceService] JWT_SECRET missing in environment configuration"
      );
      throw new Error("JWT_SECRET is not configured");
    }
    return jwt.sign({ id: instanceId }, process.env.JWT_SECRET);
  }

  async createInstance({
    name,
    imageId,
    instanceType,
    sshKey,
    volumeSize = 32,
    region,
    securityGroups = [],
    subnetId,
  }) {
    console.log("Starting EC2 instance creation process");

    const instanceParams = {
      ImageId: imageId,
      InstanceType: instanceType,
      KeyName: sshKey,
      MinCount: 1,
      MaxCount: 1,
      SecurityGroupIds: securityGroups,
      SubnetId: subnetId,
      BlockDeviceMappings: [
        {
          DeviceName: "/dev/xvda",
          Ebs: {
            VolumeSize: volumeSize,
            VolumeType: "gp2",
            DeleteOnTermination: true,
          },
        },
      ],
    };

    try {
      const data = await this.ec2.runInstances(instanceParams).promise();
      const instanceId = data.Instances[0].InstanceId;
      const hostIp = data.Instances[0].PublicIpAddress || null;
      const privateIp = data.Instances[0].PrivateIpAddress || null;
      const launchTime = new Date(data.Instances[0].LaunchTime);

      console.log(`EC2 instance created with ID: ${instanceId}`);

      await this.tagInstance(instanceId, name);
      console.log(`Instance ${instanceId} tagged successfully`);

      const accessToken = this.generateAccessToken(instanceId);

      const instance = await Instance.create({
        name: name || `instance-${instanceId}`,
        hostIp,
        privateIp,
        hostUrl: `http://${hostIp}`,
        accessToken,
        region,
        amiId: imageId,
        sshKey,
        computeType: instanceType,
        ierverType: "dedicated",
        config: instanceParams,
        maxConcurrentRequests: 1,
        status: "running",
        metrics: {},
        securityGroups,
        subnetId,
        launchTime,
      });

      console.log(`Instance saved to database with ID: ${instance.id}`);

      return { success: true, instanceId, instance };
    } catch (error) {
      console.error("Failed to create EC2 instance", { error });
      return { success: false, message: error.message };
    }
  }

  async tagInstance(instanceId, name) {
    const tagParams = {
      Resources: [instanceId],
      Tags: [
        {
          Key: "Name",
          Value: name,
        },
      ],
    };

    try {
      await this.ec2.createTags(tagParams).promise();
    } catch (error) {
      console.error("Failed to tag instance", { error });
      throw error;
    }
  }
}

module.exports = InstanceService;
