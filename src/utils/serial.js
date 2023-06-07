const generateSerial = (oldSerial) => {
  let newSerial = '' + (parseInt(oldSerial) + 1);
  if (newSerial.length < 5) {
    while (newSerial.length < 5) {
      newSerial = '0' + newSerial;
    }
  }
  return newSerial;
};

module.exports = generateSerial;
