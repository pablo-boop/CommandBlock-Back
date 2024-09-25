function formatarTelefone(phoneNumber) {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  const formattedPhone = digitsOnly.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    
  return formattedPhone;
}

module.exports = formatarTelefone;