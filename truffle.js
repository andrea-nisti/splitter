module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 1000000, // We know this is enough for this project, not necessarily your future projects
      network_id: "*" // Match any network id
    },
    net42: {
      host: "localhost",
      port: 8545,
      network_id: 42,
      gas: 800000
    }
  }
};
