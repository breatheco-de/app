import bc from '../common/services/breathecode';
import { getStorageItem } from '.';

const getOperationTypes = async () => {
  const response = await bc.media().operationTypes();
  return response.data;
};

const getOperationMeta = async (operationType) => {
  const response = await bc.media().operationMeta(operationType);
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

const uploadChunk = async (file, chunk, operationType, totalChunks, chunkIndex, academyID = undefined) => {
  try {
    const prefix = academyID ? 'academy/chunk' : 'me/chunk';

    const formData = new FormData();
    formData.append('operation_type', operationType);
    formData.append('filename', file.name);
    formData.append('total_chunks', totalChunks);
    formData.append('chunk', chunk);
    formData.append('chunk_index', chunkIndex);

    const accessToken = getStorageItem('accessToken');

    if (!accessToken) {
      console.error('No se encontró el accessToken. Asegúrate de que esté almacenado correctamente.');
      return null;
    }

    const headers = academyID ? { Academy: academyID } : { Authorization: `Token ${accessToken}` };

    const response = await bc.media().uploadChunk(prefix, formData, headers);

    console.log(response);
    return response;
  } catch (error) {
    console.error(`Error uploading chunk ${chunkIndex}:`, error);
    throw error;
  }
};

const endFileUpload = async (operationType, totalChunks, filename, mime, meta, academyID = undefined) => {
  const prefix = academyID ? 'academy/chunk/upload' : 'me/chunk/upload';

  const response = await bc.media().endFileUpload(prefix, {
    operation_type: operationType,
    total_chunks: totalChunks,
    filename,
    mime,
    meta,
  });

  return response.data;
};

const getNotifications = async (doneAt) => {
  const response = await bc.messaging().chunkNotification({ done_at: doneAt });
  return response.data;
};

const uploadFileInChunks = async (file, operationType, meta, academyID = undefined) => {
  const { chunk_size: chunkSize, max_chunks: maxChunks } = await getOperationMeta(operationType);

  const chunks = splitFileIntoChunks(file, chunkSize);
  const totalChunks = chunks.length;

  if (maxChunks && totalChunks > maxChunks) {
    throw new Error(`El archivo tiene demasiados trozos. Máximo permitido: ${maxChunks}`);
  }

  const uploadResponses = [];
  const notificationsPromises = [];

  for (let i = 0; i < totalChunks; i += 1) {
    console.log('SOY EL FILE', file);
    const response = uploadChunk(file, chunks[i], operationType, totalChunks, i, academyID);
    uploadResponses.push(response);

    const lastDoneAt = new Date().toISOString();
    const notificationsPromise = getNotifications(lastDoneAt);
    notificationsPromises.push(notificationsPromise);
  }

  const responses = await Promise.all(uploadResponses);

  const notifications = await Promise.all(notificationsPromises);
  console.log('Notifications since last chunk:', notifications);

  const lastResponse = responses[responses.length - 1];
  const { mime, name } = lastResponse?.data ?? {};

  const finalResponse = await endFileUpload(operationType, totalChunks, name, mime, meta, academyID);

  if (finalResponse.status === 'CREATED') {
    return finalResponse.id;
  }

  return finalResponse;
};

export { uploadFileInChunks, getOperationTypes };
