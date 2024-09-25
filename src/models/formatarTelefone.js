function formatarTelefone(phoneNumber) {
    phoneNumber = phoneNumber.replace(/\D/g, '');
    
    let formattedPhoneNumber = '';
    
    if (phoneNumber.length === 10) {
      formattedPhoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
      formattedPhoneNumber = `+${phoneNumber.slice(1, 4)} (${phoneNumber.slice(4, 7)}) ${phoneNumber.slice(7, 11)}-${phoneNumber.slice(11, 15)}`;
    } else {
      formattedPhoneNumber = `${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 12)}`;
    }
    
    return formattedPhoneNumber;
  }