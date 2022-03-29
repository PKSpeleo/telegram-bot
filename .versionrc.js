const VERSION_FILE = {
  filename: "VERSION",
  type: "json"
};

module.exports = {
  skip: {
    tag: true,
    commit: true,
    changelog: true
  },
  packageFiles: [
    VERSION_FILE
  ],
  bumpFiles: [
    VERSION_FILE
  ]
}
