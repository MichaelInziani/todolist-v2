//jshint esversion:6

function date() {

  const today = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return today.toLocaleDateString("en-US", options);

};

//function day() {

 // const today = new Date();

 // const options = {
 //   weekday: "long"
 // };

 // return today.toLocaleDateString("en-US", options);

//};

export default date;
//export {day};