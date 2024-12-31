const InstanceService = require("../../services/core/instanceService");
const instanceService = new InstanceService();

const InstanceController = {
  async launchInstance(req, res) {
    try {
      const { imageId, instanceType, sshKey, volumeSize } = req.body;
      const result = await instanceService.createInstance({
        imageId,
        instanceType,
        sshKey,
        volumeSize,
      });

      if (!result.success) {
        return res
          .status(500)
          .json({ message: "Failed to launch EC2 instance" });
      }

      res.status(201).json({
        message: "GPU instance launched successfully",
        instanceId: result.instanceId,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
  async createBot(req,res){
    try {
      const {system_prompt,model_name}=req.body  //using model_name to define which bot to create
      if (!system_prompt || !model_name) {
        return res.status(400).json({ error: 'System prompt and model name are required' });
    }
      const instructionPath = path.join(MODEL_DIRECTORY, 'instruc');

      fs.writeFile(instructionPath, system_prompt, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write system prompt to file' });
        }

        // Run the Ollama command to create the model
        exec(`ollama create ${model_name} -f ${instructionPath}`, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: `Error creating model: ${stderr || error.message}` });
            }

            res.status(200).json({ message: `Model ${model_name} created successfully!` });
        });
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: `Error creating model: ${error.message}` });
    }
  }
};

module.exports = InstanceController;
