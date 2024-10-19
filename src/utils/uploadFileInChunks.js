import axios from 'axios';
import modifyEnv from '../../modifyEnv';

const BASE_URL = 'https://breathecode.herokuapp.com/v2/media';
const BC_ACADEMY_TOKEN = modifyEnv({ queryString: 'bc_token', env: process.env.BC_ACADEMY_TOKEN });

const getOperationTypes = async () => {
  const response = await axios.get(`${BASE_URL}/operationtype`);
  return response.data;
};

const getOperationMeta = async (operationType) => {
  const response = await axios.get(`${BASE_URL}/operationtype/${operationType}`);
  console.log('PASO UNO finalizado', response.data);
  return response.data;
};

const splitFileIntoChunks = (file, chunkSize) => {
  const chunks = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end, file.type);
    chunks.push(chunk);
    start = end;
  }
  return chunks;
};

const uploadChunk = async (chunk, operationType, totalChunks, chunkIndex, academyID = undefined) => {
  try {
    const url = academyID ? `${BASE_URL}/academy/chunk` : `${BASE_URL}/me/chunk`;
    console.log(url);
    console.log(operationType);
    const formData = new FormData();
    formData.append('operation_type', operationType);
    formData.append('total_chunks', totalChunks);
    formData.append('chunk', chunk);
    formData.append('chunk_index', chunkIndex);

    console.log(BC_ACADEMY_TOKEN);

    const headers = academyID ? { Academy: academyID } : { Authorization: `Token ${BC_ACADEMY_TOKEN}` };

    const response = await axios.put(url, formData, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error uploading chunk ${chunkIndex}:`, error);
    throw error;
  }
};

const endFileUpload = async (operationType, totalChunks, filename, mime, meta, academyID = undefined) => {
  const url = academyID ? `${BASE_URL}/academy/chunk/upload` : `${BASE_URL}/me/chunk/upload`;

  const response = await axios.post(url, {
    operation_type: operationType,
    total_chunks: totalChunks,
    filename,
    mime,
    meta: JSON.stringify(meta),
  });
  return response.data;
};

const uploadFileInChunks = async (file, operationType, academyID = undefined) => {
  const { chunk_size: chunkSize, max_chunks: maxChunks } = await getOperationMeta(operationType);

  const chunks = splitFileIntoChunks(file, chunkSize);

  const totalChunks = chunks.length;
  if (maxChunks && totalChunks > maxChunks) {
    throw new Error(`El archivo tiene demasiados trozos. Maximo permitido: ${maxChunks}`);
  }

  const uploadPromises = chunks.map((chunk, index) => uploadChunk(chunk, operationType, totalChunks, index, academyID));

  const uploadResponses = await Promise.all(uploadPromises);
  console.log('ALL CHUNKS UPLOADED!');

  const lastResponse = uploadResponses[uploadResponses.length - 1];
  const { mime, name } = lastResponse;

  const meta = {
    operation_type: operationType,
    total_chunks: totalChunks,
    filename: file.name,
    mime: file.type,
    meta: JSON.stringify({
      slug: operationType,
      name: file.name,
      categories: [],
      academy: academyID || null,
    }),
  };

  const finalResponse = await endFileUpload(operationType, totalChunks, name, mime, meta, academyID);

  if (finalResponse.status === 'CREATED') {
    return finalResponse.id;
  }

  return finalResponse;
};

export { uploadFileInChunks, getOperationTypes };
