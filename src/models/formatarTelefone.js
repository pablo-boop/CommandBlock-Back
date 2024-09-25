function formatarTelefone(phoneNumber) {
  phoneNumber = phoneNumber.replace(/\D/g, '');

  let formattedPhoneNumber = '';
  formattedPhoneNumber = `${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 12)}`;

  return formattedPhoneNumber;
}

module.exports = formatarTelefone;