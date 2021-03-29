module.exports = {

  STORAGE_BUCKET: "cloudlead-app-storage",
  issuer: "cloudlead",
  Tokens:{
    login:{
      signOptions:{
        issuer: "login",
        expiresIn: "12h",
        algorithm: "RS256",
      }
    },
    confirm:{
      signOptions:{
        issuer: "confirm",
        expiresIn: "3h",
        algorithm: "RS256",
      }
    },
    passReset:{
      signOptions:{
        issuer: "passReset",
        expiresIn: "1h",
        algorithm: "RS256",
      }
    },
  }
};
