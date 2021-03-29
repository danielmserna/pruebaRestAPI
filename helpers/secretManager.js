// Load the AWS SDK
var AWS = require('aws-sdk'),
	region = "us-east-2",
	endpoint="https://vpce-0177555335244db49-tvurs35s.secretsmanager.us-east-2.vpce.amazonaws.com";

module.exports = {
	getSecret: async function (secretName) {
		const secretsManager = new AWS.SecretsManager({
			endpoint,
			region,
		});
		try {
			const data = await secretsManager.getSecretValue({
				SecretId: secretName,
			}).promise();

			if (data) {
				if (data.SecretString) {
					const secret = data.SecretString;
					const parsedSecret = JSON.parse(secret);
					return {
						secrets: parsedSecret,
					};
				}

				const binarySecretData = data.SecretBinary;
				return binarySecretData;
			}
		} catch (error) {
			console.log('Error retrieving secrets');
			console.log(error);
		}
	},
}


