import { SSM } from 'aws-sdk';

class SystemsManager {

  constructor() {
    this.ssm = new SSM();
  }

  async getParameter(name) {
    const {
      Parameter: {
        Value:
        value
      }
    } = await this.ssm.getParameter({
      Name: name,
      WithDecryption:true,
    }).promise();
    console.log(`Parameter: ${name} value: ${value}`);
    return value;
  }

}

export default SystemsManager;