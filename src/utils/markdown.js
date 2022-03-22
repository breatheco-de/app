import atob from 'atob';

const decodeFromBinary = (encoded) => {
  // decode base 64 encoded string with emojis
  const decoded = decodeURIComponent(
    atob(encoded).split('').map((c) => {
      const decodedEmoist = `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`;
      return decodedEmoist;
    }).join(''),
  );

  return decoded;
};
export default decodeFromBinary;
