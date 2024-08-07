const {
  checkAllContainers,
  checkHealthyContainers,
  checkUnhealthyContainers,
} = require("./routes/utils");

const GetContainers = async () => {
  const ContainerList = await checkAllContainers();
  return ContainerList;
};

GetContainers()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
